const STORAGE_KEYS = {
  users: 'petamor_users',
  ads: 'petamor_ads',
  posts: 'petamor_posts',
  session: 'petamor_session'
};

const DEFAULT_USERS = [
  {
    id: 'admin-1',
    name: 'Admin Pet Amor',
    email: 'admin@petamor.com',
    password: 'Admin@123',
    role: 'admin',
    status: 'active'
  },
  {
    id: 'user-1',
    name: 'Maria Silva',
    email: 'maria@petamor.com',
    password: 'Maria@123',
    role: 'user',
    status: 'active'
  }
];

const DEFAULT_ADS = [
  {
    id: 'ad-1',
    title: 'Ajude no tratamento do Thor',
    pet: 'Thor',
    owner: 'Clínica Esperança',
    status: 'active'
  },
  {
    id: 'ad-2',
    title: 'Nova ração para gatos resgatados',
    pet: 'Nina',
    owner: 'Lar dos Peludos',
    status: 'active'
  },
  {
    id: 'ad-3',
    title: 'Campanha de vacinação da equipe',
    pet: 'Diversos',
    owner: 'SOS Animais',
    status: 'active'
  }
];

const DEFAULT_POSTS = [
  {
    id: 'post-1',
    user_id: 'admin-1',
    title: 'Luna precisa de um lar acolhedor',
    description: 'Luna é uma cachorra muito carinhosa, tranquila e sociável. Ela tem 2 anos e adora brincar e acompanhar pessoas em casa.',
    animalType: 'Cachorro',
    breed: 'Golden Retriever',
    city: 'São Paulo',
    state: 'SP',
    location: 'São Paulo / SP',
    contactPhone: '(11) 99999-0001',
    contactEmail: 'adocao@petamor.com',
    contactSocials: '@petamor.saopaulo',
    photo: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'post-2',
    user_id: 'user-1',
    title: 'Nina em busca de um lar seguro',
    description: 'Nina é uma gata dócil e muito inteligente. Ela se adapta bem em ambientes tranquilos e é muito afetuosa.',
    animalType: 'Gato',
    breed: 'Siamês',
    city: 'Rio de Janeiro',
    state: 'RJ',
    location: 'Rio de Janeiro / RJ',
    contactPhone: '(21) 98888-0102',
    contactEmail: 'nina@petamor.com',
    contactSocials: '@ninaadocao',
    photo: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80'
  }
];

const supabaseUrl = 'https://sqosvgesugekqvgucepn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxb3N2Z2VzdWdla3F2Z3VjZXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNDQ3MzYsImV4cCI6MjEwNDYyMDczNn0.3cMMFMHsCKgeCT3OSucgNKwt7XwYaZIrE14U1M5fR-Y';

const ALLOWED_EMAIL_DOMAINS = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'live.com'];

function readStorage(key, fallback) {
  const raw = localStorage.getItem(key);

  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeedData() {
  const users = readStorage(STORAGE_KEYS.users, DEFAULT_USERS);
  const ads = readStorage(STORAGE_KEYS.ads, DEFAULT_ADS);
  const posts = readStorage(STORAGE_KEYS.posts, DEFAULT_POSTS);

  if (!Array.isArray(users) || !users.length) {
    writeStorage(STORAGE_KEYS.users, DEFAULT_USERS);
  }

  if (!Array.isArray(ads) || !ads.length) {
    writeStorage(STORAGE_KEYS.ads, DEFAULT_ADS);
  }

  if (!Array.isArray(posts) || !posts.length) {
    writeStorage(STORAGE_KEYS.posts, DEFAULT_POSTS);
  }
}

function getSupabaseClient() {
  if (!window.supabase) return null;

  if (!window.__supabaseClient && supabaseUrl && supabaseUrl.includes('supabase.co')) {
    window.__supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
  }

  return window.__supabaseClient || null;
}

function saveSession(user) {
  const payload = {
    userId: user.id || user.user_id,
    role: user.role || 'user',
    email: user.email,
    name: user.name || user.full_name || user.email
  };

  writeStorage(STORAGE_KEYS.session, payload);
}

function getSession() {
  return readStorage(STORAGE_KEYS.session, null);
}

function isValidEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized || !normalized.includes('@')) return false;

  const [localPart, domain] = normalized.split('@');
  if (!localPart || !domain || localPart.length < 2) return false;

  return ALLOWED_EMAIL_DOMAINS.includes(domain) || domain.endsWith('.com') || domain.endsWith('.net') || domain.endsWith('.org');
}

function getPasswordStrength(password) {
  let score = 0;

  if (!password) return { score: 0, label: 'Sem senha', color: '#ef4444' };

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score: 1, label: 'Fraca', color: '#ef4444' };
  if (score === 3 || score === 4) return { score: 2, label: 'Média', color: '#f59e0b' };
  return { score: 3, label: 'Forte', color: '#22c55e' };
}

function updatePasswordStrength(password) {
  const strength = getPasswordStrength(password);
  const bar = document.getElementById('passwordStrengthBar');
  const text = document.getElementById('passwordStrengthText');

  if (!bar || !text) return;

  const widthMap = { 0: '0%', 1: '35%', 2: '70%', 3: '100%' };
  bar.style.width = widthMap[strength.score] || '0%';
  bar.style.background = strength.color;
  text.textContent = `Força da senha: ${strength.label}`;
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

async function fetchProfileByUserId(userId) {
  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();
    if (!error && data) return data;
  }

  const users = readStorage(STORAGE_KEYS.users, DEFAULT_USERS);
  return users.find((user) => user.id === userId) || null;
}

async function loginWithSupabase(email, password) {
  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const profile = await fetchProfileByUserId(data.user.id);
    return {
      id: data.user.id,
      email: data.user.email,
      name: profile?.full_name || data.user.user_metadata?.full_name || data.user.email,
      role: profile?.role || 'user',
      status: profile?.status || 'active'
    };
  }

  const users = readStorage(STORAGE_KEYS.users, DEFAULT_USERS);
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);

  if (!user) throw new Error('Credenciais inválidas.');
  if (user.status === 'banned') throw new Error('Usuário banido.');

  return user;
}

async function registerWithSupabase(name, email, password) {
  if (!name || !name.trim()) throw new Error('Informe seu nome completo.');
  if (!isValidEmail(email)) throw new Error('Use um e-mail válido com domínio conhecido.');

  const strength = getPasswordStrength(password);
  if (strength.score < 2) {
    throw new Error('Sua senha é fraca. Use pelo menos 8 caracteres e misture letras, números e símbolos.');
  }

  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim()
        }
      }
    });

    if (error) throw new Error(error.message);

    const userId = data.user?.id;
    if (userId) {
      await client.from('profiles').upsert({
        id: userId,
        email,
        full_name: name.trim(),
        role: 'user',
        status: 'active'
      });
    }

    return {
      id: userId,
      email,
      name: name.trim(),
      role: 'user',
      status: 'active'
    };
  }

  const users = readStorage(STORAGE_KEYS.users, DEFAULT_USERS);
  const exists = users.some((item) => item.email.toLowerCase() === email.toLowerCase());

  if (exists) throw new Error('Este e-mail já está em uso.');

  const newUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email,
    password,
    role: 'user',
    status: 'active'
  };

  users.push(newUser);
  writeStorage(STORAGE_KEYS.users, users);
  return newUser;
}

function updateHomeUserActions() {
  const session = getSession();
  const actionsNode = document.getElementById('homeUserActions');

  if (!actionsNode) return;

  if (!session) {
    actionsNode.innerHTML = `
      <a href="login.html" class="btn btn-secondary">Entrar</a>
      <a href="register.html" class="btn btn-primary">Cadastrar</a>
    `;
    return;
  }

  const isAdmin = session.role === 'admin';

  actionsNode.innerHTML = `
    ${isAdmin ? '<a href="admin.html" class="btn btn-light">Acessar painel admin</a>' : ''}
    <a href="create-post.html" class="btn btn-secondary">Criar publicação</a>
    <button class="btn btn-secondary" id="homeLogoutButton">Sair</button>
  `;

  const logoutButton = document.getElementById('homeLogoutButton');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      clearSession();
      updateHomeUserActions();
    });
  }
}

function redirectIfLoggedOut() {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

function renderAdminDashboard() {
  const ads = readStorage(STORAGE_KEYS.ads, DEFAULT_ADS);
  const users = readStorage(STORAGE_KEYS.users, DEFAULT_USERS);
  const totalAds = ads.length;
  const activeUsers = users.filter((user) => user.status !== 'banned').length;
  const bannedUsers = users.filter((user) => user.status === 'banned').length;

  const totalAdsNode = document.getElementById('totalAds');
  const totalUsersNode = document.getElementById('totalUsers');
  const totalBansNode = document.getElementById('totalBans');

  if (totalAdsNode) totalAdsNode.textContent = totalAds;
  if (totalUsersNode) totalUsersNode.textContent = activeUsers;
  if (totalBansNode) totalBansNode.textContent = bannedUsers;

  const adsTableBody = document.getElementById('adsTableBody');
  const usersTableBody = document.getElementById('usersTableBody');

  if (adsTableBody) {
    adsTableBody.innerHTML = ads
      .map(
        (ad) => `
          <tr>
            <td>${ad.title}</td>
            <td>${ad.pet}</td>
            <td>${ad.owner}</td>
            <td><span class="status-pill ${ad.status === 'active' ? 'active' : 'inactive'}">${ad.status}</span></td>
            <td>
              <button class="admin-btn danger" data-action="delete-ad" data-id="${ad.id}">Excluir</button>
            </td>
          </tr>
        `
      )
      .join('');
  }

  if (usersTableBody) {
    usersTableBody.innerHTML = users
      .map(
        (user) => `
          <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td><span class="status-pill ${user.status === 'active' ? 'active' : 'inactive'}">${user.status === 'banned' ? 'banido' : 'ativo'}</span></td>
            <td>
              <button class="admin-btn ${user.status === 'banned' ? 'secondary' : 'danger'}" data-action="toggle-ban" data-id="${user.id}">
                ${user.status === 'banned' ? 'Remover ban' : 'Banir'}
              </button>
            </td>
          </tr>
        `
      )
      .join('');
  }
}

function deleteAd(adId) {
  const ads = readStorage(STORAGE_KEYS.ads, DEFAULT_ADS);
  const updatedAds = ads.filter((ad) => ad.id !== adId);
  writeStorage(STORAGE_KEYS.ads, updatedAds);
  renderAdminDashboard();
}

function toggleUserBan(userId) {
  const users = readStorage(STORAGE_KEYS.users, DEFAULT_USERS);
  const updatedUsers = users.map((user) => {
    if (user.id !== userId) return user;
    return {
      ...user,
      status: user.status === 'banned' ? 'active' : 'banned'
    };
  });

  writeStorage(STORAGE_KEYS.users, updatedUsers);
  renderAdminDashboard();
}

function bindAdminActions() {
  document.body.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const { action, id } = button.dataset;

    if (action === 'delete-ad') {
      deleteAd(id);
    }

    if (action === 'toggle-ban') {
      toggleUserBan(id);
    }
  });
}

function validateImageFile(file) {
  if (!file) return 'Selecione uma imagem.';

  const name = file.name.toLowerCase();
  const allowedExtensions = /\.(jpe?g|png)$/i;
  const allowedTypes = ['image/jpeg', 'image/png'];

  if (!allowedExtensions.test(name) || !allowedTypes.includes(file.type)) {
    return 'Formato inválido. Envie apenas arquivos .jpg, .jpeg ou .png.';
  }

  if (file.size > 2 * 1024 * 1024) {
    return 'A imagem deve ter no máximo 2MB.';
  }

  return null;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    reader.readAsDataURL(file);
  });
}

async function uploadPostImage(file) {
  const client = getSupabaseClient();

  if (client) {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const { data, error } = await client.storage.from('pet-photos').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type
    });

    if (!error && data?.path) {
      const { data: publicUrlData } = client.storage.from('pet-photos').getPublicUrl(data.path);
      return publicUrlData.publicUrl;
    }
  }

  return readFileAsDataUrl(file);
}

async function saveCreatedPost(postData) {
  const client = getSupabaseClient();

  if (client) {
    const { data, error } = await client.from('posts').insert([postData]);
    if (error) throw new Error(error.message);
    return data;
  }

  const posts = readStorage(STORAGE_KEYS.posts, DEFAULT_POSTS);
  posts.unshift(postData);
  writeStorage(STORAGE_KEYS.posts, posts);
  return postData;
}

async function handleCreatePostSubmit(event) {
  event.preventDefault();

  const session = getSession();
  if (!session) {
    alert('Você precisa fazer login para criar uma publicação.');
    window.location.href = 'login.html';
    return;
  }

  const form = event.currentTarget;
  const title = form.title.value.trim();
  const description = form.description.value.trim();
  const animalType = form.animalType.value;
  const breed = form.breed.value.trim();
  const city = form.city.value.trim();
  const state = form.state.value.trim();
  const phone = form.phone.value.trim();
  const email = form.email.value.trim();
  const socials = form.socials.value.trim();
  const photoFile = form.photo.files[0];

  const imageError = validateImageFile(photoFile);
  if (imageError) {
    alert(imageError);
    return;
  }

  if (!title || !description || !animalType || !city || !state) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  if (!phone && !email && !socials) {
    alert('Informe pelo menos um meio de contato externo.');
    return;
  }

  if (email && !isValidEmail(email)) {
    alert('Informe um e-mail válido para contato.');
    return;
  }

  try {
    const photoUrl = await uploadPostImage(photoFile);

    const post = {
      id: `post-${Date.now()}`,
      user_id: session.userId,
      title,
      description,
      animalType,
      breed: animalType === 'Cachorro' || animalType === 'Gato' ? (breed || 'Não informado') : 'Não se aplica',
      city,
      state,
      location: `${city} / ${state}`,
      contactPhone: phone,
      contactEmail: email,
      contactSocials: socials,
      photo: photoUrl,
      created_at: new Date().toISOString()
    };

    await saveCreatedPost(post);
    alert('Publicação criada com sucesso!');
    window.location.href = 'index.html';
  } catch (error) {
    alert(error.message || 'Erro ao criar a publicação.');
  }
}

function renderFeed() {
  const posts = readStorage(STORAGE_KEYS.posts, DEFAULT_POSTS);
  const feedTarget = document.getElementById('feedPosts');
  const typeField = document.getElementById('feedType');
  const breedField = document.getElementById('feedBreed');
  const locationField = document.getElementById('feedLocation');

  if (!feedTarget) return;

  const locationValue = (locationField?.value || '').trim().toLowerCase();
  const typeValue = typeField?.value || 'Todos';
  const breedValue = (breedField?.value || '').trim().toLowerCase();

  const filteredPosts = posts.filter((post) => {
    const matchesLocation = !locationValue || `${post.city} ${post.state}`.toLowerCase().includes(locationValue) || post.location.toLowerCase().includes(locationValue);
    const matchesType = typeValue === 'Todos' || post.animalType === typeValue;
    const matchesBreed = !breedValue || !post.breed || post.breed.toLowerCase().includes(breedValue);

    return matchesLocation && matchesType && matchesBreed;
  });

  if (!filteredPosts.length) {
    feedTarget.innerHTML = '<div class="empty-state">Nenhum animal encontrado com estes filtros.</div>';
    return;
  }

  feedTarget.innerHTML = filteredPosts
    .map(
      (post) => `
        <article class="feed-card">
          <img src="${post.photo}" alt="${post.title}" />
          <div class="feed-card-body">
            <div class="feed-card-header">
              <div>
                <span class="mini-tag">${post.animalType}</span>
                <h3>${post.title}</h3>
              </div>
              <span class="feed-location">📍 ${post.location}</span>
            </div>
            <p>${post.description}</p>
            <div class="feed-meta">
              <span><strong>Raça:</strong> ${post.breed || 'Não informado'}</span>
              <span><strong>Contato:</strong> ${post.contactPhone || post.contactEmail || post.contactSocials || 'Não informado'}</span>
            </div>
            <div class="feed-contact-list">
              ${post.contactPhone ? `<span>📞 ${post.contactPhone}</span>` : ''}
              ${post.contactEmail ? `<span>✉️ ${post.contactEmail}</span>` : ''}
              ${post.contactSocials ? `<span>💬 ${post.contactSocials}</span>` : ''}
            </div>
          </div>
        </article>
      `
    )
    .join('');
}

function renderRecentPosts() {
  const target = document.getElementById('recentPosts');
  if (!target) return;

  const posts = readStorage(STORAGE_KEYS.posts, DEFAULT_POSTS)
    .slice()
    .sort((firstPost, secondPost) => {
      const firstDate = firstPost.created_at ? new Date(firstPost.created_at).getTime() : 0;
      const secondDate = secondPost.created_at ? new Date(secondPost.created_at).getTime() : 0;
      return secondDate - firstDate;
    })
    .slice(0, 3);

  target.innerHTML = posts
    .map(
      (post) => `
        <article class="recent-post-card">
          <img src="${post.photo}" alt="${post.title}" />
          <div class="recent-post-body">
            <span class="mini-tag">${post.animalType}</span>
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <span class="recent-post-location">📍 ${post.location}</span>
          </div>
        </article>
      `
    )
    .join('');
}

function setupFeedFilters() {
  const typeField = document.getElementById('feedType');
  const breedField = document.getElementById('feedBreed');
  const breedWrap = document.getElementById('breedFilterWrap');

  if (!typeField || !breedField || !breedWrap) return;

  const toggleBreedFilter = () => {
    const isVisible = typeField.value === 'Cachorro' || typeField.value === 'Gato';
    breedWrap.style.display = isVisible ? 'block' : 'none';
    if (!isVisible) {
      breedField.value = '';
    }
  };

  typeField.addEventListener('change', toggleBreedFilter);
  toggleBreedFilter();

  const locationField = document.getElementById('feedLocation');
  const searchBtn = document.getElementById('applyFiltersBtn');

  if (searchBtn) {
    searchBtn.addEventListener('click', renderFeed);
  }

  if (locationField) {
    locationField.addEventListener('input', renderFeed);
  }

  if (breedField) {
    breedField.addEventListener('input', renderFeed);
  }

  typeField.addEventListener('change', renderFeed);
  renderFeed();
}

function setupAdoptionCarousel() {
  const carousel = document.getElementById('adoptionCarousel');
  const previousButton = document.getElementById('previousCategory');
  const nextButton = document.getElementById('nextCategory');

  if (!carousel || !previousButton || !nextButton) return;

  const scrollAmount = () => carousel.clientWidth * 0.85;

  previousButton.addEventListener('click', () => {
    carousel.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
  });

  nextButton.addEventListener('click', () => {
    carousel.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
  });
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!isValidEmail(email)) {
    alert('Informe um e-mail válido.');
    return;
  }

  try {
    const user = await loginWithSupabase(email, password);
    if (user.status === 'banned') {
      alert('Usuário banido.');
      return;
    }

    saveSession(user);
    window.location.href = 'index.html';
  } catch (error) {
    alert(error.message || 'Erro ao entrar.');
  }
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value.trim();
  const confirmPassword = document.getElementById('registerConfirmPassword').value.trim();

  if (!name) {
    alert('Informe seu nome completo.');
    return;
  }

  if (!isValidEmail(email)) {
    alert('Use um e-mail válido com domínio conhecido.');
    return;
  }

  if (password !== confirmPassword) {
    alert('As senhas não coincidem.');
    return;
  }

  const strength = getPasswordStrength(password);
  if (strength.score < 2) {
    alert('Senha fraca. Use pelo menos 8 caracteres e misture letras, números e símbolos.');
    return;
  }

  try {
    const user = await registerWithSupabase(name, email, password);
    saveSession(user);
    alert('Conta criada com sucesso!');
    window.location.href = 'index.html';
  } catch (error) {
    alert(error.message || 'Erro ao criar conta.');
  }
}

function handleLogout() {
  clearSession();
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  ensureSeedData();

  const page = document.body.dataset.page;

  const passwordInput = document.getElementById('registerPassword');
  if (passwordInput) {
    passwordInput.addEventListener('input', (event) => updatePasswordStrength(event.target.value));
  }

  if (page === 'home') {
    updateHomeUserActions();
    renderRecentPosts();
    setupAdoptionCarousel();
    setupFeedFilters();
  }

  if (page === 'login') {
    const existingSession = getSession();
    if (existingSession) {
      window.location.href = 'index.html';
      return;
    }

    const form = document.getElementById('loginForm');
    if (form) form.addEventListener('submit', handleLoginSubmit);
  }

  if (page === 'register') {
    const form = document.getElementById('registerForm');
    if (form) form.addEventListener('submit', handleRegisterSubmit);
  }

  if (page === 'create-post') {
    const session = redirectIfLoggedOut();
    if (!session) return;

    const form = document.getElementById('createPostForm');
    if (form) form.addEventListener('submit', handleCreatePostSubmit);
  }

  if (page === 'admin') {
    const session = redirectIfLoggedOut();
    if (!session) return;

    if (session.role !== 'admin') {
      alert('Acesso restrito. Somente administradores podem entrar neste painel.');
      window.location.href = 'index.html';
      return;
    }

    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    bindAdminActions();
    renderAdminDashboard();
  }
});

