const pets = [
  {
    name: 'Luna',
    type: 'cachorro',
    age: '2 anos',
    temperament: 'Carinhosa',
    description: 'Adora correr no parque e brincar com crianças.',
    image:
      'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Thor',
    type: 'cachorro',
    age: '4 anos',
    temperament: 'Protetor',
    description: 'Muito fiel, companheiro e tranquilo em casa.',
    image:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Nina',
    type: 'gato',
    age: '1 ano',
    temperament: 'Dócil',
    description: 'Curiosa, inteligente e muito carinhosa.',
    image:
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Pippo',
    type: 'outros',
    age: '8 meses',
    temperament: 'Energetico',
    description: 'Apreciador de carinho e companhia.',
    image:
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80'
  }
];

const petGrid = document.getElementById('petGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const donationForm = document.getElementById('donationForm');

function renderPets(filter = 'all') {
  const filteredPets = filter === 'all' ? pets : pets.filter((pet) => pet.type === filter);

  petGrid.innerHTML = filteredPets
    .map(
      (pet) => `
        <article class="pet-card-item">
          <img src="${pet.image}" alt="${pet.name}" />
          <div class="pet-info">
            <div class="pet-header">
              <h3>${pet.name}</h3>
              <span>${pet.age}</span>
            </div>
            <p class="tag">${pet.temperament}</p>
            <p>${pet.description}</p>
            <button class="btn btn-card">Quero adotar</button>
          </div>
        </article>
      `
    )
    .join('');
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    renderPets(button.dataset.filter);
  });
});

if (donationForm) {
  donationForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const type = document.getElementById('type').value;
    const message = document.getElementById('message').value.trim();

    const donationData = {
      name,
      email,
      type,
      message,
      created_at: new Date().toISOString()
    };

    const isSupabaseReady = typeof window.supabase !== 'undefined';

    if (isSupabaseReady) {
      // Futuro: integrar com Supabase real usando os dados do formulário.
      // const { data, error } = await supabase.from('donations').insert([donationData]);
      // if (error) throw error;
      console.log('Dados prontos para enviar ao Supabase:', donationData);
    } else {
      console.log('Dados salvos localmente no navegador:', donationData);
    }

    alert('Obrigado por ajudar! Sua mensagem foi registrada com sucesso.');
    donationForm.reset();
  });
}

renderPets();

// Estrutura para conexão futura com Supabase
const supabaseUrl = 'SUA_URL_DO_SUPABASE';
const supabaseKey = 'SUA_CHAVE_ANONIMA_DO_SUPABASE';

if (supabaseUrl && supabaseKey && supabaseUrl !== 'SUA_URL_DO_SUPABASE') {
  const supabase = window.supabase?.createClient(supabaseUrl, supabaseKey);

  async function saveDonationToSupabase(data) {
    if (!supabase) return;

    const { error } = await supabase.from('donations').insert([data]);

    if (error) {
      console.error('Erro ao salvar no Supabase:', error.message);
      return;
    }

    console.log('Doação salva com sucesso no Supabase.');
  }

  window.saveDonationToSupabase = saveDonationToSupabase;
}
