import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";
import LegalPage from "@/app/components/legal-page";

export const metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="30 October 2026">
      <p>By using {SITE_NAME} you agree to these terms.</p>

      <section>
        <h2>The service</h2>
        <p>
          {SITE_NAME} is free. We only show listings and help tenants contact owners. We are not
          an agent, we do not own or check the houses, and we are not part of any rental agreement.
        </p>
      </section>

      <section>
        <h2>If you post a listing</h2>
        <ul>
          <li>Only post places you own or are allowed to rent out.</li>
          <li>Give a true price, location and photos, and use your own phone number.</li>
          <li>Mark it as rented or delete it when it is no longer available.</li>
          <li>Listings expire after 30 days unless you renew them.</li>
        </ul>
        <p className="mt-2">We may remove fake, misleading or duplicate listings without notice.</p>
      </section>

      <section>
        <h2>If you are looking for a house</h2>
        <p>
          Always visit the house and meet the owner before paying anything. Any deal is between you
          and the owner, and {SITE_NAME} is not responsible for losses or disputes.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions or problems: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </section>
    </LegalPage>
  );
}
