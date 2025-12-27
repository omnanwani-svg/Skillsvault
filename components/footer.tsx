"use client"

export default function Footer() {
  const contributors = [
    {
      name: "Om Nanwani",
      role: "Lead",
      instagram: "https://www.instagram.com/btw_itzz_om?igsh=MzRlODBiNWFlZA==",
      linkedin: "#",
    },
    {
      name: "Abhishek Jaiswal",
      role: "Contributor",
      instagram: "https://www.instagram.com/abhiz.exe?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      linkedin: "#",
    },
    {
      name: "Samrat Dixit",
      role: "Contributor",
      instagram: "https://www.instagram.com/ayussh_dixit?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      linkedin: "#",
    },
  ]

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-1 animate-fade-in">
            <h3 className="text-2xl font-bold text-primary mb-2">SkillsVault</h3>
            <p className="text-muted-foreground text-sm">Empowering Skills, Building Futures</p>
          </div>

          {/* Navigation Links */}
          <div className="animate-fade-in animate-delay-100">
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["About", "Contact", "Privacy Policy", "Terms of Service"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="animate-fade-in animate-delay-200">
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=skillsvault00@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm hover:underline"
            >
              skillsvault00@gmail.com
            </a>
          </div>

          {/* Contributors Section */}
          <div className="animate-fade-in animate-delay-300">
            <h4 className="font-semibold text-foreground mb-4">Contributors</h4>
            <div className="space-y-3 text-sm">
              {contributors.map((contributor) => (
                <div key={contributor.name}>
                  <p className="text-muted-foreground">
                    <span className="text-primary font-medium">{contributor.role}:</span>
                  </p>
                  <div className="flex items-center gap-2 ml-2">
                    <a
                      href={contributor.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium hover:underline"
                    >
                      {contributor.name}
                    </a>
                    <div className="flex gap-1">
                      {contributor.instagram !== "#" && (
                        <a
                          href={contributor.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors duration-300 text-xs"
                          title="Instagram"
                        >
                          📷
                        </a>
                      )}
                      {contributor.linkedin !== "#" && (
                        <a
                          href={contributor.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors duration-300 text-xs"
                          title="LinkedIn"
                        >
                          💼
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8"></div>

        {/* Copyright Section */}
        <div className="text-center animate-fade-in animate-delay-400">
          <p className="text-muted-foreground text-sm">© 2025 SkillsVault — Empowering Skills, Building Futures.</p>
        </div>
      </div>
    </footer>
  )
}
