import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Layout, Zap, Shield } from "lucide-react";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 z-0 bg-gradient-mesh opacity-50 dark:opacity-20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 glass">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white">
            <Layout className="h-5 w-5" />
          </div>
          <span>ProManage</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost" className="hover-lift">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button className="hover-lift shadow-lg shadow-primary/20">Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center">
        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 animate-float">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
          v2.0 is now live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 max-w-4xl">
          Manage Projects with <br />
          <span className="text-primary">Unparalleled Clarity</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          The all-in-one workspace for your team. Plan, track, and ship world-class software with a platform designed for modern engineering teams.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link to="/register">
            <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 hover-lift shadow-xl shadow-primary/20 group">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-12 px-8 hover-lift glass bg-white/50 dark:bg-black/20">
              Live Demo
            </Button>
          </Link>
        </div>

        {/* Hero Image Mockup */}
        <div className="mt-20 relative w-full max-w-5xl perspective-[2000px]">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 h-full w-full pointer-events-none" />
          <div className="relative rounded-xl border border-white/20 glass p-2 shadow-2xl transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">
            <div className="rounded-lg overflow-hidden bg-background/50 aspect-video">
                {/* Simulated Dashboard UI */}
                <div className="h-full w-full bg-grid-white/10 flex items-center justify-center text-muted-foreground/20 text-4xl font-black uppercase tracking-widest">
                    Dashboard Preview
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-4 py-24 bg-muted/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-2xl hover-lift">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-6">
                    <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Built with performance in mind. Real-time updates via Socket.io ensure you never miss a beat.
                </p>
            </div>
            <div className="glass-card p-8 rounded-2xl hover-lift animate-delay-100">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6">
                    <Layout className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Modern Kanban</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Visualize your workflow with our drag-and-drop Kanban board. Customizable columns for any process.
                </p>
            </div>
            <div className="glass-card p-8 rounded-2xl hover-lift animate-delay-200">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6">
                    <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Enterprise Secure</h3>
                <p className="text-muted-foreground leading-relaxed">
                    Bank-grade security with HttpOnly cookies, JWT authentication, and role-based access control.
                </p>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-border/40 bg-background/50 backdrop-blur-sm text-center text-muted-foreground text-sm">
        <p>&copy; 2024 ProManage Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
