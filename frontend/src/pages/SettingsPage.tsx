import { motion } from "framer-motion"
import { Check, X, ArrowRight } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "month",
      description: "Perfect for individual lawyers and small practices",
      cta: "Start Free Trial",
      highlighted: false,
      features: [
        { name: "5 active cases", included: true },
        { name: "Up to 50 documents", included: true },
        { name: "AI chat (100 msgs/month)", included: true },
        { name: "Basic law references", included: true },
        { name: "Email support", included: true },
        { name: "Team collaboration", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Custom integrations", included: false },
      ],
    },
    {
      name: "Pro",
      price: "$99",
      period: "month",
      description: "Best for growing law firms and consultants",
      cta: "Get Started",
      highlighted: true,
      features: [
        { name: "Unlimited cases", included: true },
        { name: "Up to 500 documents", included: true },
        { name: "AI chat unlimited", included: true },
        { name: "Full law database access", included: true },
        { name: "Priority support", included: true },
        { name: "Team collaboration (5 members)", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Custom integrations", included: false },
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large firms needing advanced features",
      cta: "Contact Sales",
      highlighted: false,
      features: [
        { name: "Unlimited everything", included: true },
        { name: "Custom document storage", included: true },
        { name: "Advanced AI features", included: true },
        { name: "Priority law database updates", included: true },
        { name: "Dedicated support", included: true },
        { name: "Unlimited team members", included: true },
        { name: "Advanced analytics & reporting", included: true },
        { name: "Custom integrations & API", included: true },
      ],
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <motion.div
      className="p-8 space-y-12 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-[#2B2B2B]">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-[#8A8A8A] max-w-2xl mx-auto">
          Choose the perfect plan for your legal practice. All plans include a 14-day free trial.
        </p>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div variants={itemVariants} className="flex justify-center items-center gap-4">
        <span className="text-[#5A5A5A]">Monthly</span>
        <button className="relative w-14 h-7 bg-[#C67C4E] rounded-full transition-all">
          <div className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full transition-all"></div>
        </button>
        <span className="text-[#5A5A5A]">
          Annual <span className="text-[#10B981] font-semibold">(Save 20%)</span>
        </span>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -8 }}
            className={`rounded-2xl transition-all ${
              plan.highlighted
                ? "bg-gradient-to-br from-[#C67C4E] to-[#8B6F47] text-white shadow-xl ring-2 ring-[#C67C4E] scale-105"
                : "bg-white border border-[#E3E3E3] text-[#2B2B2B] shadow-lg"
            }`}
          >
            {/* Featured Badge */}
            {plan.highlighted && (
              <div className="bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-full inline-block m-6 mb-0">
                MOST POPULAR
              </div>
            )}

            <div className="p-8 space-y-6">
              {/* Plan Name */}
              <div>
                <h2 className={`text-2xl font-bold mb-2 ${plan.highlighted ? "" : "text-[#2B2B2B]"}`}>
                  {plan.name}
                </h2>
                <p className={plan.highlighted ? "opacity-90" : "text-[#8A8A8A]"}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className={plan.highlighted ? "opacity-75" : "text-[#8A8A8A]"}>/{plan.period}</span>}
                </div>
                <p className={`text-sm mt-2 ${plan.highlighted ? "opacity-90" : "text-[#8A8A8A]"}`}>
                  14 days free, then recurring charge
                </p>
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? "bg-white text-[#C67C4E] hover:bg-[#FAFAFA]"
                    : "bg-[#C67C4E] text-white hover:bg-[#A86039]"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Features */}
              <div className="space-y-3 pt-6 border-t border-current border-opacity-20">
                {plan.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? "" : "text-[#10B981]"}`} />
                    ) : (
                      <X className={`w-5 h-5 flex-shrink-0 mt-0.5 opacity-30`} />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? plan.highlighted
                            ? ""
                            : ""
                          : `${plan.highlighted ? "opacity-50" : "text-[#8A8A8A]"}`
                      }`}
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-[#E3E3E3] p-8 space-y-6">
        <h2 className="text-3xl font-bold text-[#2B2B2B]">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {[
            {
              q: "Can I change plans at any time?",
              a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.",
            },
            {
              q: "Do you offer discounts for annual billing?",
              a: "Yes! Annual plans come with a 20% discount compared to monthly billing.",
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards (Visa, Mastercard, Amex) and wire transfers for Enterprise plans.",
            },
            {
              q: "Is there a money-back guarantee?",
              a: "Yes, we offer a 30-day money-back guarantee if you're not satisfied with the service.",
            },
          ].map((item, idx) => (
            <details key={idx} className="group border border-[#E3E3E3] rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#FAFAFA] transition-all">
                <h3 className="font-semibold text-[#2B2B2B]">{item.q}</h3>
                <span className="text-[#8A8A8A] group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="px-4 pb-4 text-[#5A5A5A]">{item.a}</p>
            </details>
          ))}
        </div>
      </motion.div>

      {/* Trust Section */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-[#C67C4E] to-[#8B6F47] text-white rounded-2xl p-12 text-center space-y-4">
        <h2 className="text-3xl font-bold">Trusted by 500+ Law Firms</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Join leading law firms and consultants who are transforming their practice with AI-powered legal analysis.
        </p>
        <div className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-white/20">
          <div className="text-center">
            <p className="text-3xl font-bold">99.9%</p>
            <p className="text-sm opacity-75">Uptime SLA</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">SOC 2</p>
            <p className="text-sm opacity-75">Certified</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">GDPR</p>
            <p className="text-sm opacity-75">Compliant</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}