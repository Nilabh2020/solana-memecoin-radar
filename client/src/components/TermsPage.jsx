export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-gray-300">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Terms of Service</h1>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">1. Acceptance of Terms</h2>
          <p className="text-gray-400">
            By accessing and using Solana Meme Coin Radar ("the Service"), you agree to be bound by
            these Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">2. Service Description</h2>
          <p className="text-gray-400">
            The Service provides real-time analytics and data visualization for tokens on the Solana
            blockchain. It is a read-only analytics tool and does not facilitate trading or financial
            transactions other than subscription payments.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">3. Not Financial Advice</h2>
          <p className="text-gray-400">
            All information provided by the Service is for informational and educational purposes only.
            Nothing on this platform constitutes financial advice, investment advice, trading advice, or
            any other sort of advice. You should not treat any of the Service's content as such.
            Cryptocurrency trading involves substantial risk of loss. Past performance does not
            guarantee future results.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">4. Premium Subscriptions</h2>
          <p className="text-gray-400">
            Premium features are accessed via SOL payments on the Solana blockchain. Payments are
            non-refundable once verified. Monthly subscriptions expire after 30 days. Lifetime
            subscriptions are valid indefinitely. The Service reserves the right to modify pricing
            with notice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">5. Disclaimer of Warranties</h2>
          <p className="text-gray-400">
            The Service is provided "as is" without warranty of any kind. We do not guarantee the
            accuracy, completeness, or timeliness of any data displayed. Data is sourced from
            third-party APIs and blockchain state, which may contain errors or delays.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">6. Limitation of Liability</h2>
          <p className="text-gray-400">
            In no event shall the Service be liable for any indirect, incidental, special, or
            consequential damages arising out of or in connection with your use of the Service,
            including but not limited to financial losses from trading decisions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-200 mb-2">7. Changes to Terms</h2>
          <p className="text-gray-400">
            We reserve the right to modify these terms at any time. Continued use of the Service
            after changes constitutes acceptance of the new terms.
          </p>
        </section>
      </div>

      <p className="mt-8 text-xs text-gray-600">Last updated: February 2026</p>
    </div>
  );
}
