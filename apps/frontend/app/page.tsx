'use client';

import React from 'react';
import { Activity, Shield, Globe, Bell, ArrowRight, Server, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

function App() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <nav className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-emerald-500" />
              <span className="text-xl font-bold">UptimePro</span>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#features" className="hover:text-emerald-500 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing</a>
              <button className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
              Monitor Your Services Like Never Before
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Advanced uptime monitoring with real-time alerts, detailed analytics, and comprehensive reporting.
              Keep your services running 24/7.
            </p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => router.push('/dashboard')} className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
                <span>Start Monitoring</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="border border-gray-700 hover:border-emerald-500 px-6 py-3 rounded-lg transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose UptimePro?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Globe className="w-6 h-6 text-emerald-500" />}
                title="Global Monitoring"
                description="Monitor from multiple locations worldwide for accurate uptime tracking"
              />
              <FeatureCard
                icon={<Bell className="w-6 h-6 text-emerald-500" />}
                title="Instant Alerts"
                description="Get notified immediately when your services experience issues"
              />
              <FeatureCard
                icon={<Server className="w-6 h-6 text-emerald-500" />}
                title="API Monitoring"
                description="Advanced API endpoint monitoring with detailed health checks"
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-emerald-500" />}
                title="SSL Monitoring"
                description="Track SSL certificate expiration and security status"
              />
              <FeatureCard
                icon={<Clock className="w-6 h-6 text-emerald-500" />}
                title="Response Time"
                description="Track and analyze response times with detailed metrics"
              />
              <FeatureCard
                icon={<CheckCircle className="w-6 h-6 text-emerald-500" />}
                title="99.9% Accuracy"
                description="Reliable monitoring with minimal false positives"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-6 bg-gray-800 rounded-lg">
                <div className="text-4xl font-bold text-emerald-500 mb-2">99.99%</div>
                <div className="text-gray-400">Uptime Guarantee</div>
              </div>
              <div className="p-6 bg-gray-800 rounded-lg">
                <div className="text-4xl font-bold text-emerald-500 mb-2">5,000+</div>
                <div className="text-gray-400">Active Users</div>
              </div>
              <div className="p-6 bg-gray-800 rounded-lg">
                <div className="text-4xl font-bold text-emerald-500 mb-2">1M+</div>
                <div className="text-gray-400">Checks Per Day</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-6 h-6 text-emerald-500" />
                <span className="text-xl font-bold">UptimePro</span>
              </div>
              <p className="text-gray-400">
                Advanced monitoring for modern applications and services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-500">Features</a></li>
                <li><a href="#" className="hover:text-emerald-500">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-500">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-500">About</a></li>
                <li><a href="#" className="hover:text-emerald-500">Blog</a></li>
                <li><a href="#" className="hover:text-emerald-500">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-emerald-500">Privacy</a></li>
                <li><a href="#" className="hover:text-emerald-500">Terms</a></li>
                <li><a href="#" className="hover:text-emerald-500">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 UptimePro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

export default App;