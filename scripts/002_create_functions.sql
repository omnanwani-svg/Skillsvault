-- Function to update time balance
CREATE OR REPLACE FUNCTION public.update_time_balance(user_id UUID, hours_change NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET time_balance = time_balance + hours_change,
      total_earned = CASE WHEN hours_change > 0 THEN total_earned + hours_change ELSE total_earned END,
      total_spent = CASE WHEN hours_change < 0 THEN total_spent + ABS(hours_change) ELSE total_spent END,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id UUID)
RETURNS TABLE (
  total_skills INT,
  total_requests INT,
  average_rating NUMERIC,
  time_balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT s.id)::INT as total_skills,
    COUNT(DISTINCT sr.id)::INT as total_requests,
    COALESCE(AVG(r.rating), 0)::NUMERIC as average_rating,
    COALESCE(p.time_balance, 0)::NUMERIC as time_balance
  FROM public.profiles p
  LEFT JOIN public.skills s ON s.user_id = p.id
  LEFT JOIN public.skill_requests sr ON sr.provider_id = p.id
  LEFT JOIN public.ratings r ON r.rated_user_id = p.id
  WHERE p.id = user_id
  GROUP BY p.id, p.time_balance;
END;
$$ LANGUAGE plpgsql;
