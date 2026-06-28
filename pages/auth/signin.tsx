import { getProviders, signIn } from "next-auth/react";

export default function SignIn({ providers }: any) {
  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: 16 }}>
      <h1>Sign in</h1>
      <div>
        {Object.values(providers || {}).map((provider: any) => (
          <div key={provider.name} style={{ margin: "8px 0" }}>
            <button onClick={() => signIn(provider.id)}>{provider.name} Sign in</button>
          </div>
        ))}
      </div>
    </main>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return { props: { providers } };
}
