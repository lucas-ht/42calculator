import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <main className="container grow justify-center p-4 md:p-12 lg:p-24">
      <Card className="w-full bg-card/5 backdrop-blur-sm">
        <CardContent className="p-0 md:p-6">
          <article className="prose max-w-none text-justify prose-headings:text-foreground prose-p:text-muted-foreground">
            <h1>Privacy Policy</h1>

            <h2>Effective Date: 26/06/2024</h2>

            <p>
              Welcome to 42calculator! Your privacy is important to us. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website
              https://42calculator.fr. Please read this privacy policy
              carefully. If you do not agree with the terms of this privacy
              policy, please do not access the site.
            </p>

            <h2>1. Information We Collect</h2>

            <h3>&#x2022; Temporary Data Storage</h3>
            <p>
              We do not store any personal information from our users
              permanently. Any data retrieved from the 42 API, including the
              user&apos;s 42 cursus and its projects, is stored temporarily in a
              Redis instance for a duration of 24 hours. This data is fetched
              when you log in to the site.
            </p>

            <h3>&#x2022; Cookies</h3>
            <p>
              We use cookies solely for managing user sessions. Cookies are
              small data files that are placed on your device when you visit a
              website. These cookies are used to ensure the proper functioning
              of the site and to maintain your session.
            </p>

            <h2>2. How We Use Your Information</h2>

            <h3>&#x2022; Session Management</h3>
            <p>
              The temporary data stored in the Redis instance, including the
              user&apos;s 42 cursus and its projects, is used to fetch relevant
              information from the 42 API during your visit. This data is stored
              in a Redis instance for up to 24 hours and is not retained beyond
              this period.
            </p>

            <h2>3. Disclosure of Your Information</h2>
            <p>
              We do not share, sell, or otherwise disclose any information to
              third parties. Since we do not store any user information
              permanently, there is no personal data to disclose.
            </p>

            <h2>4. Cookies and Tracking Technologies</h2>

            <h3>&#x2022; Cookies</h3>
            <p>
              As mentioned, we use cookies to manage user sessions. These
              cookies are essential for the functionality of the website and do
              not track or store personal information beyond the session
              duration.
            </p>

            <h2>5. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures
              to help protect your temporary session data. While we have taken
              reasonable steps to secure the data you provide to us, please be
              aware that no security measures are perfect or impenetrable, and
              no method of data transmission can be guaranteed against any
              interception or other type of misuse.
            </p>

            <h2>6. Data Deletion</h2>
            <p>
              Users have the ability to delete their information stored in our
              system. Within the user management section, there is a dedicated
              button that allows you to delete all your data, including your 42
              cursus and its projects, from our system. If you wish to delete
              your data, you can do so easily by using this feature.
            </p>

            <h2>7. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time in order to
              reflect changes to our practices or for other operational, legal,
              or regulatory reasons. Any changes to this Privacy Policy will be
              posted on this page. You are advised to review this Privacy Policy
              periodically for any changes. Changes to this Privacy Policy are
              effective when they are posted on this page.
            </p>
          </article>
        </CardContent>
      </Card>
    </main>
  );
}
