document.addEventListener('DOMContentLoaded', function(){
	const BOX_COST = 5;
	const balanceEl = document.getElementById('balance');
	const buyBtn = document.getElementById('buyBox');
	const rail = document.getElementById('rail');
	const railWrap = document.querySelector('.rail-wrap');
	const resultName = document.getElementById('prizeName');
	const inventoryList = document.getElementById('inventoryList');

	let balance = Number(localStorage.getItem('sim_balance')) || 100;
	let inventory = JSON.parse(localStorage.getItem('sim_inventory') || '[]');

	const skins = [
		{name: 'P250 | Sand Dune', rarity:'common', weight:790, color:'#94a3b8', img:'p250_sand_dune.svg'},
		{name: 'Glock-18 | Fade', rarity:'uncommon', weight:150, color:'#c084fc', img:'glock_fade.svg'},
		{name: 'M4A1-S | Hyper Beast', rarity:'rare', weight:40, color:'#06b6d4', img:'m4a1s_hyper_beast.svg'},
		{name: 'AK-47 | Redline', rarity:'epic', weight:18, color:'#ef4444', img:'ak47_redline.svg'},
		{name: 'AWP | Dragon Lore', rarity:'legendary', weight:2, color:'#f59e0b', img:'awp_dragon_lore.svg'}
        
	];

	function saveState(){
		localStorage.setItem('sim_balance', String(balance));
		localStorage.setItem('sim_inventory', JSON.stringify(inventory));
	}

	function updateBalance(){
		balanceEl.textContent = balance.toString();
	}

	function weightedPick(items){
		const total = items.reduce((s,i)=>s+i.weight,0);
		let r = Math.random()*total;
		for(const it of items){
			if(r < it.weight) return it;
			r -= it.weight;
		}
		return items[items.length-1];
	}

	function makeCard(item){
		const el = document.createElement('div');
		el.className = 'card';
		if(item.img){
			const img = document.createElement('img');
			img.src = item.img;
			img.alt = item.name;
			el.appendChild(img);
		}
		const name = document.createElement('div'); name.className='name'; name.textContent = item.name;
		const rarity = document.createElement('div'); rarity.className = 'rarity rarity-'+item.rarity; rarity.textContent = item.rarity.toUpperCase();
		el.appendChild(name); el.appendChild(rarity);
		el.style.border = `2px solid ${item.color}`;
		return el;
	}

	function renderInventory(){
		inventoryList.innerHTML = '';
		if(inventory.length===0){
			inventoryList.innerHTML = '<li>Nenhuma skin ainda.</li>';
			return;
		}
		inventory.forEach(it=>{
			const li = document.createElement('li');
			li.textContent = `${it.name} — ${it.rarity}`;
			inventoryList.appendChild(li);
		});
	}

	function buildRail(prize){
		rail.innerHTML = '';
		const visible = 21;
		const mid = Math.floor(visible/2);
		// fill with random items but put prize at center
		for(let i=0;i<visible;i++){
			let item;
			if(i===mid) item = prize;
			else item = skins[Math.floor(Math.random()*skins.length)];
			rail.appendChild(makeCard(item));
		}
		return {index:mid, count:visible};
	}

	function openBox(){
		if(buyBtn.disabled) return;
		if(balance < BOX_COST){
			alert('Saldo insuficiente.');
			return;
		}
		balance -= BOX_COST; updateBalance(); saveState();
		buyBtn.disabled = true; buyBtn.textContent = 'Abrindo...';

		// Escolhe prêmio por peso
		const prize = weightedPick(skins);
		const {index, count} = buildRail(prize);

		// small delay to allow DOM render
		requestAnimationFrame(()=>{
			const cards = Array.from(rail.children);
			const target = cards[index];
			const wrapRect = railWrap.getBoundingClientRect();
			const targetRect = target.getBoundingClientRect();
			const railRect = rail.getBoundingClientRect();
			// current rail left is railRect.left; we will compute translate to center target
			const currentTranslate = 0; // initial
			const wrapCenter = wrapRect.width/2;
			const targetCenterInRail = target.offsetLeft + target.offsetWidth/2;
			const translateX = wrapCenter - targetCenterInRail;
			rail.style.transition = 'transform 2s cubic-bezier(.2,.9,.2,1)';
			rail.style.transform = `translateX(${translateX}px)`;

			function onEnd(){
				rail.removeEventListener('transitionend', onEnd);
				resultName.textContent = prize.name + ' (' + prize.rarity + ')';
				inventory.push(prize);
				saveState();
				renderInventory();
				buyBtn.disabled = false; buyBtn.textContent = `Abrir Caixa (${BOX_COST} créditos)`;
				// reset rail after small timeout so user can open again with fresh rail
				setTimeout(()=>{ rail.style.transition='none'; rail.style.transform='none'; }, 300);
			}
			rail.addEventListener('transitionend', onEnd);
		});
	}

	// init
	updateBalance(); renderInventory();

	buyBtn.addEventListener('click', openBox);
});
