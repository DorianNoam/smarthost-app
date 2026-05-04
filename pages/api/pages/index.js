import { useState } from 'react';

export default function SmartHost() {
  const [question, setQuestion] = useState("");
  const [reponse, setReponse] = useState("");
  const [loading, setLoading] = useState(false);

  const demanderIA = async () => {
    setLoading(true);
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    setReponse(data.text);
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto', textAlign: 'center' }}>
      <h1 style={{ color: '#0070f3' }}>SmartHost AI 🏠</h1>
      <p>Testez votre concierge en direct :</p>
      <input 
        style={{ width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
        value={question} 
        onChange={(e) => setQuestion(e.target.value)} 
        placeholder="Posez une question (ex: code wifi ?)"
      />
      <button 
        onClick={demanderIA} 
        style={{ width: '100%', padding: '15px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {loading ? "Recherche dans la base de données..." : "Demander au concierge"}
      </button>
      {reponse && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '12px', textAlign: 'left', borderLeft: '5px solid #0070f3' }}>
          <strong>Réponse du concierge :</strong>
          <p>{reponse}</p>
        </div>
      )}
    </div>
  );
}
