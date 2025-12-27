# Admin Guide

This guide explains how to use the SkillsVault admin panel to manage the platform.

## Accessing the Admin Panel

1. Ensure your account has admin privileges:
   \`\`\`sql
   UPDATE profiles 
   SET is_admin = true 
   WHERE email = 'your-email@example.com';
   \`\`\`

2. Log in to your account

3. Click the red "Admin Panel" link in the navigation bar

4. You'll be redirected to `/admin`

## Admin Dashboard Overview

The admin dashboard provides:
- Platform statistics
- User management
- Skill verification
- Video moderation
- Flagged content review

## Managing Skills

### Viewing Pending Skills

1. Navigate to the "Skills" tab in the admin panel
2. You'll see all skills with `pending_review` or `pending` status
3. Each skill shows:
   - Title and description
   - User who created it
   - Certificate details (URL, issuer, ID)
   - Verification status

### Verifying Skills

1. Click on a skill to view details
2. Click the certificate URL to verify authenticity
3. Review the certificate issuer and ID
4. Click "Verify" to approve the skill
5. The skill will be marked as verified and appear in the marketplace

### Rejecting Skills

1. Click on a skill to view details
2. If the certificate is invalid or suspicious, click "Reject"
3. The skill will be marked as rejected
4. The user will need to resubmit with valid credentials

### Auto-Verification

Skills are automatically verified if the certificate URL contains:
- coursera.org
- linkedin.com/learning
- google.com/certificates
- udemy.com/certificate
- edx.org/certificates
- udacity.com/certificate
- pluralsight.com/achievements
- khanacademy.org/certificates
- freecodecamp.org/certification
- codecademy.com/profiles

## Managing Videos

### Viewing Pending Videos

1. Navigate to the "Videos" tab
2. You'll see all unverified videos
3. Each video shows:
   - Title and description
   - Thumbnail preview
   - User who uploaded it
   - Upload date

### Verifying Videos

1. Click on a video to watch it
2. Ensure the content is appropriate and relevant
3. Click "Verify" to approve
4. Add optional verification notes
5. The video will appear in the public video gallery

### Rejecting Videos

1. Click on a video to review
2. If content is inappropriate or violates guidelines, click "Reject"
3. Add verification notes explaining the rejection
4. The user will be notified

## Managing Users

### Viewing User List

1. Navigate to the "Users" tab
2. View all registered users with:
   - Email and name
   - Time balance
   - Total earned/spent
   - Join date

### User Statistics

Each user profile shows:
- Number of skills offered
- Number of requests sent/received
- Average rating
- Total transactions

### Moderating Users

1. Click on a user to view their profile
2. Review their activity and content
3. Take action if necessary:
   - Suspend account (requires custom implementation)
   - Remove inappropriate content
   - Reset time balance (if needed)

## Platform Statistics

The dashboard shows:
- **Total Users**: Number of registered users
- **Total Skills**: Number of skill listings
- **Total Transactions**: Completed skill exchanges
- **Total Videos**: Uploaded videos
- **Pending Skills**: Skills awaiting verification
- **Pending Videos**: Videos awaiting moderation

## Flagged Content

### Reviewing Reports

1. Navigate to the "Flagged Content" tab
2. View user-reported content
3. Each report shows:
   - Content type (skill, video, message)
   - Reporter information
   - Reason for flagging
   - Timestamp

### Taking Action

1. Review the flagged content
2. Determine if it violates guidelines
3. Take appropriate action:
   - Remove content
   - Warn user
   - No action needed (dismiss report)

## Best Practices

### Certificate Verification

- Always click the certificate URL to verify authenticity
- Check that the certificate issuer matches the URL domain
- Verify the certificate ID is valid
- Look for signs of tampering or fake certificates
- When in doubt, reject and ask for clarification

### Video Moderation

- Watch videos completely before approving
- Ensure content is educational and appropriate
- Check for copyright violations
- Verify video quality is acceptable
- Reject spam or promotional content

### User Management

- Monitor user activity regularly
- Address complaints promptly
- Be fair and consistent in moderation
- Document decisions for transparency
- Communicate clearly with users

### Platform Monitoring

- Check statistics daily
- Monitor growth trends
- Identify and address issues quickly
- Respond to user feedback
- Keep the community safe and engaged

## Common Tasks

### Making Another User an Admin

\`\`\`sql
UPDATE profiles 
SET is_admin = true 
WHERE email = 'new-admin@example.com';
\`\`\`

### Resetting a User's Time Balance

\`\`\`sql
UPDATE profiles 
SET time_balance = 10 
WHERE email = 'user@example.com';
\`\`\`

### Viewing All Unverified Skills

\`\`\`sql
SELECT s.*, p.full_name, p.email 
FROM skills s
JOIN profiles p ON s.user_id = p.id
WHERE s.verification_status IN ('pending', 'pending_review')
ORDER BY s.created_at DESC;
\`\`\`

### Bulk Verifying Skills

\`\`\`sql
UPDATE skills 
SET is_verified = true, verification_status = 'auto_verified'
WHERE certificate_issuer IN ('Coursera', 'LinkedIn Learning', 'Google');
\`\`\`

## Troubleshooting

### Admin Panel Not Showing

- Verify `is_admin = true` in your profile
- Clear browser cache and refresh
- Check console for errors
- Ensure you're logged in

### Can't Verify Skills

- Check database permissions
- Verify API endpoints are working
- Check browser console for errors
- Ensure Supabase connection is active

### Statistics Not Loading

- Check API route `/api/admin/stats`
- Verify database queries are working
- Check for RLS policy issues
- Review server logs

## Security Considerations

- Never share admin credentials
- Use strong passwords
- Enable 2FA on your account
- Monitor admin activity logs
- Regularly review user permissions
- Keep the platform updated
- Report security issues immediately

## Support

For admin support:
- Check the main README.md
- Review API documentation
- Contact platform maintainers
- Report bugs on GitHub
