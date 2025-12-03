document.addEventListener('DOMContentLoaded', function(){
	const balanceEl = document.getElementById('balance');
	const skinListEl = document.getElementById('skinList');
	const skinCountEl = document.getElementById('skinCount');
	const totalValueEl = document.getElementById('totalValue');
	const sellAllBtn = document.getElementById('sellAll');

	let balance = Number(localStorage.getItem('sim_balance')) || 100;
	let inventory = JSON.parse(localStorage.getItem('sim_inventory') || '[]');

	// Valores de venda por raridade
	const sellValues = {
		'common': 2,
		'uncommon': 5,
		'rare': 12,
		'epic': 28,
		'legendary': 120
	};

	function saveState(){
		localStorage.setItem('sim_balance', String(balance));
		localStorage.setItem('sim_inventory', JSON.stringify(inventory));
	}

	function updateBalance(){
		balanceEl.textContent = balance.toString();
	}

	function updateStats(){
		skinCountEl.textContent = inventory.length.toString();
		const totalValue = inventory.reduce((sum, skin) => sum + (sellValues[skin.rarity] || 0), 0);
		totalValueEl.textContent = totalValue.toString();
	}

	function getSkinImage(imgName){
		return imgName ? imgName : 'placeholder.svg';
	}

	function renderSkins(){
		skinListEl.innerHTML = '';

		if(inventory.length === 0){
			skinListEl.innerHTML = '<div class="empty-msg">Seu inventário está vazio.</div>';
			updateStats();
			return;
		}

		inventory.forEach((skin, index) => {
			const value = sellValues[skin.rarity] || 0;
			const card = document.createElement('div');
			card.className = 'skin-card';
			card.innerHTML = `
				<div class="skin-card-image">
					<img src="${getSkinImage(skin.img)}" alt="${skin.name}">
				</div>
				<div class="skin-card-info">
					<div class="skin-name">${skin.name}</div>
					<div class="skin-rarity rarity-${skin.rarity}">${skin.rarity.toUpperCase()}</div>
					<div class="skin-value">Vender: <strong>${value}</strong> créditos</div>
					<button class="btn btn-sell" data-index="${index}">Vender</button>
				</div>
			`;

			card.querySelector('.btn-sell').addEventListener('click', () => {
				sellSkin(index);
			});

			skinListEl.appendChild(card);
		});

		updateStats();
	}

	function sellSkin(index){
		if(index < 0 || index >= inventory.length) return;

		const skin = inventory[index];
		const value = sellValues[skin.rarity] || 0;

		inventory.splice(index, 1);
		balance += value;

		saveState();
		updateBalance();
		renderSkins();

		showNotification(`${skin.name} vendida por ${value} créditos!`);
	}

	function sellAllSkins(){
		if(inventory.length === 0){
			alert('Seu inventário está vazio!');
			return;
		}

		const totalValue = inventory.reduce((sum, skin) => sum + (sellValues[skin.rarity] || 0), 0);

		if(confirm(`Tem certeza? Você receberá ${totalValue} créditos por ${inventory.length} skin(s).`)){
			balance += totalValue;
			inventory = [];
			saveState();
			updateBalance();
			renderSkins();
			showNotification(`Inventário vendido por ${totalValue} créditos!`);
		}
	}

	function showNotification(msg){
		const notif = document.createElement('div');
		notif.className = 'notification';
		notif.textContent = msg;
		document.body.appendChild(notif);

		setTimeout(() => {
			notif.classList.add('show');
		}, 10);

		setTimeout(() => {
			notif.classList.remove('show');
			setTimeout(() => notif.remove(), 300);
		}, 2000);
	}

	// Init
	updateBalance();
	renderSkins();

	sellAllBtn.addEventListener('click', sellAllSkins);
});
