'use client';
import { useEffect, useState } from 'react';

interface HeroSlideData {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  order: number;
}

export default function HeroManager() {
  const [slides, setSlides] = useState<HeroSlideData[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer tous les slides
  useEffect(() => {
    fetch('/api/hero-slides')
      .then(res => res.json())
      .then(data => {
        setSlides(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement des slides...</p>;

  const handleChange = (id: string, field: string, value: string | number) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveSlide = async (slide: HeroSlideData) => {
    await fetch(`/api/hero-slides/${slide.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slide),
    });
    alert('Slide mis à jour !');
  };

  const deleteSlide = async (id: string) => {
    await fetch(`/api/hero-slides/${id}`, { method: 'DELETE' });
    setSlides(slides.filter(s => s.id !== id));
  };

  const addSlide = async () => {
    const res = await fetch('/api/hero-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: '', title: '', subtitle: '', order: slides.length }),
    });
    const newSlide = await res.json();
    setSlides([...slides, newSlide]);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Gestion des slides Hero</h2>
      <button onClick={addSlide} className="mb-4 px-4 py-2 bg-green-500 text-white rounded">Ajouter un slide</button>
      {slides.map(slide => (
        <div key={slide.id} className="mb-4 p-4 border rounded-lg bg-white shadow">
          <input
            type="text"
            value={slide.title}
            placeholder="Titre"
            className="w-full mb-2 p-2 border rounded"
            onChange={(e) => handleChange(slide.id, 'title', e.target.value)}
          />
          <input
            type="text"
            value={slide.subtitle}
            placeholder="Sous-titre"
            className="w-full mb-2 p-2 border rounded"
            onChange={(e) => handleChange(slide.id, 'subtitle', e.target.value)}
          />
          <input
            type="text"
            value={slide.image}
            placeholder="URL image"
            className="w-full mb-2 p-2 border rounded"
            onChange={(e) => handleChange(slide.id, 'image', e.target.value)}
          />
          <input
            type="number"
            value={slide.order}
            placeholder="Ordre"
            className="w-full mb-2 p-2 border rounded"
            onChange={(e) => handleChange(slide.id, 'order', Number(e.target.value))}
          />
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-yellow-400 rounded" onClick={() => saveSlide(slide)}>Enregistrer</button>
            <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => deleteSlide(slide.id)}>Supprimer</button>
          </div>
        </div>
      ))}
    </div>
  );
}
