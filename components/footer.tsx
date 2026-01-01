"use client"

interface FooterProps {
  shopName: string
}

export default function Footer({ shopName }: FooterProps) {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-foreground font-semibold mb-2">{shopName}</p>
        <p className="text-sm text-muted-foreground">Serving since 2019</p>
        <div className="mt-4">
          <a
            href="https://wa.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  )
}
