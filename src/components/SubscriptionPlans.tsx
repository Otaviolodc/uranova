'use client'

import { useState } from 'react'
import { supabase }
from "@/lib/supabase/client";

const plans = [
  {
    name: 'Free',
    price: '$0',
    features: ['5 links', 'Basic analytics', 'Custom theme'],
    buttonText: 'Current Plan',
    current: true
  },
  {
    name: 'Pro',
    price: '$9',
    features: ['Unlimited links', 'Advanced analytics', 'Custom domain', 'Priority support'],
    buttonText: 'Upgrade to Pro',
    current: false
  },
  {
    name: 'Business',
    price: '$29',
    features: ['Unlimited links', 'White-label', 'API access', 'Dedicated support'],
    buttonText: 'Upgrade to Business',
    current: false
  }
]

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState(false)

  const handleSubscription = async (plan: string) => {
    if (plan === 'Free') return

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          plan: plan
        }),
      })

      const { sessionId, url, error: sessionError } = await response.json()
      
      if (sessionError) {
        throw new Error(sessionError)
      }

      // Use a URL direta do Stripe se disponível, senão constrói manualmente
      if (url) {
        window.location.href = url
      } else if (sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
      } else {
        throw new Error('No session data received')
      }
      
    } catch (error: any) {
      alert('Error: ' + error.message)
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div key={plan.name} className={`bg-white p-6 rounded-lg shadow-md ${
          plan.current ? 'ring-2 ring-blue-600' : ''
        }`}>
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className="text-3xl font-bold mt-2">{plan.price}<span className="text-sm font-normal">/month</span></p>
          
          <ul className="mt-4 space-y-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleSubscription(plan.name)}
            disabled={plan.current || loading}
            className={`w-full mt-6 py-2 px-4 rounded-md ${
              plan.current
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            {loading ? 'Processing...' : plan.buttonText}
          </button>
        </div>
      ))}
    </div>
  )
}
