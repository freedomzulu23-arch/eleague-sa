export default function AdminPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#18181b', color: 'white', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>👑 Admin Dashboard</h1>
            <p style={{ color: '#a1a1aa', marginTop: '4px' }}>Admin panel - Coming soon</p>
          </div>
          <a
            href="/dashboard"
            style={{ backgroundColor: '#27272a', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none' }}
          >
            ← Back to Dashboard
          </a>
        </div>

        <div style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🚧</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Admin Panel Under Construction</h2>
          <p style={{ color: '#a1a1aa' }}>The admin dashboard is being rebuilt.</p>
        </div>
      </div>
    </div>
  );
}