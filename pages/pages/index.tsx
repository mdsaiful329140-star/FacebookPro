import { useState } from "react";
import useSWR from "swr";
import { signIn, signOut, useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const { data: session } = useSession();
  const { data: posts, mutate } = useSWR("/api/posts", fetcher);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });
    if (res.ok) {
      setContent("");
      mutate(); // revalidate
    } else {
      const data = await res.json();
      alert(data?.message || "Failed to create post");
    }
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 700, margin: "40px auto", padding: "0 16px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1>facebook-pro</h1>
        <div>
          {session?.user ? (
            <>
              <span style={{ marginRight: 12 }}>Signed in as {session.user.email}</span>
              <button onClick={() => signOut()}>Sign out</button>
            </>
          ) : (
            <button onClick={() => signIn()}>Sign in</button>
          )}
        </div>
      </header>

      {session?.user && (
        <form onSubmit={createPost} style={{ marginBottom: 24 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            style={{ width: "100%", padding: 12 }}
          />
          <div style={{ marginTop: 8 }}>
            <button type="submit" disabled={loading}>{loading ? "Posting…" : "Post"}</button>
          </div>
        </form>
      )}

      <section>
        {!posts && <div>Loading posts…</div>}
        {posts && posts.length === 0 && <div>No posts yet.</div>}
        {posts && posts.map((p: any) => (
          <article key={p.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>{p.author?.name || p.author?.email}</div>
            <div style={{ color: "#555", marginTop: 6 }}>{p.content}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>{new Date(p.createdAt).toLocaleString()}</div>
          </article>
        ))}
      </section>
    </main>
  );
}
