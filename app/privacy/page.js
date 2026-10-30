import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";
import LegalPage from "@/app/components/legal-page";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="30 October 2026">
      <p>
        {SITE_NAME} is a free website for finding and posting houses and flats for rent in Bhutan.
        This page explains what information we collect and how we use it.
      </p>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Google account:</strong> when you log in with Google we receive your name,
            email address and profile photo. We use them only to identify your account.
          </li>
          <li>
            <strong>Listings:</strong> the details you post, such as title, rent, location,
            photos and phone number.
          </li>
          <li>
            <strong>Reports:</strong> the reason you choose when you report a listing. Reports are
            anonymous.
          </li>
        </ul>
        <p className="mt-2">Visitors can browse without an account. We do not use advertising or tracking cookies.</p>
      </section>

      <section>
        <h2>What others can see</h2>
        <p>
          Your listing is public. Your phone number is shown only when a visitor taps
          “Show phone number”. Your email address is never shown to anyone.
        </p>
      </section>

      <section>
        <h2>Where it is stored</h2>
        <p>
          Data is stored with Supabase (database, login and photos) and the website runs on
          Vercel. We do not sell or share your information with anyone else.
        </p>
      </section>

      <section>
        <h2>Deleting your data</h2>
        <p>
          You can delete any of your listings and their photos at any time from “My listings”.
          To delete your account, email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </section>
    </LegalPage>
  );
}
