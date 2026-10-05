(() => {
	'use strict';

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------- Footer year ---------- */
	const yearEl = document.getElementById('year');
	if (yearEl) yearEl.textContent = new Date().getFullYear();

	/* ---------- Sticky header shadow on scroll ---------- */
	const header = document.getElementById('site-header');
	if (header) {
		const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
	}

	/* ---------- Mobile nav toggle ---------- */
	const navToggle = document.getElementById('nav-toggle');
	const navLinks = document.getElementById('nav-links');
	if (navToggle && navLinks) {
		navToggle.addEventListener('click', () => {
			const isOpen = navLinks.classList.toggle('open');
			navToggle.setAttribute('aria-expanded', String(isOpen));
		});
		navLinks.querySelectorAll('a').forEach((link) => {
			link.addEventListener('click', () => {
				navLinks.classList.remove('open');
				navToggle.setAttribute('aria-expanded', 'false');
			});
		});
	}

	/* ---------- Reveal-on-scroll ---------- */
	const revealEls = document.querySelectorAll('.reveal');
	if (reduceMotion || !('IntersectionObserver' in window)) {
		revealEls.forEach((el) => el.classList.add('in-view'));
	} else {
		const revealObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('in-view');
						revealObserver.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
		);
		revealEls.forEach((el, i) => {
			el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
			revealObserver.observe(el);
		});
	}

	/* ---------- Active nav link on scroll ---------- */
	const sections = document.querySelectorAll('main section[id]');
	const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
	if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
		const setActive = (id) => {
			navAnchors.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
		};
		const sectionObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) setActive(entry.target.id);
				});
			},
			{ rootMargin: '-45% 0px -50% 0px', threshold: 0 }
		);
		sections.forEach((s) => sectionObserver.observe(s));
	}

	/* ---------- Typed role effect ---------- */
	const typedEl = document.getElementById('typed-role');
	if (typedEl) {
		const roles = ['Network Engineer', 'Automation Engineer', 'VPN & Security Specialist'];
		if (reduceMotion) {
			typedEl.textContent = roles[0];
		} else {
			let i = roles[0].length;
			let dir = -1; // -1 = deleting, 1 = typing
			let idx = 0;
			typedEl.textContent = roles[0];

			const step = () => {
				const word = roles[idx];
				i += dir;
				typedEl.textContent = word.slice(0, i);
				if (dir === -1 && i === 0) {
					dir = 1;
					idx = (idx + 1) % roles.length;
					setTimeout(step, 400);
					return;
				}
				if (dir === 1 && i === word.length) {
					dir = -1;
					setTimeout(step, 1600);
					return;
				}
				setTimeout(step, dir === 1 ? 70 : 40);
			};
			setTimeout(step, 1800);
		}
	}

	const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

	/* ---------- Scroll progress bar ---------- */
	const progressBar = document.getElementById('scroll-progress');
	if (progressBar) {
		const updateProgress = () => {
			const docEl = document.documentElement;
			const scrollTop = docEl.scrollTop || document.body.scrollTop;
			const scrollHeight = (docEl.scrollHeight || document.body.scrollHeight) - docEl.clientHeight;
			const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
			progressBar.style.width = `${pct}%`;
		};
		updateProgress();
		window.addEventListener('scroll', updateProgress, { passive: true });
		window.addEventListener('resize', updateProgress, { passive: true });
	}

	/* ---------- Cursor glow ---------- */
	const cursorGlow = document.getElementById('cursor-glow');
	if (cursorGlow && canHover && !reduceMotion) {
		let targetX = window.innerWidth / 2;
		let targetY = window.innerHeight / 2;
		let curX = targetX;
		let curY = targetY;
		let hovering = false;
		let active = false;
		const hoverSelectors = 'a, button, .skill-card, .contact-card, .case-study, input, .tag';

		window.addEventListener('pointermove', (e) => {
			targetX = e.clientX;
			targetY = e.clientY;
			if (!active) {
				active = true;
				cursorGlow.classList.add('active');
			}
			const el = e.target.closest && e.target.closest(hoverSelectors);
			hovering = !!el;
			cursorGlow.classList.toggle('hover', hovering);
		}, { passive: true });

		document.addEventListener('mouseleave', () => {
			active = false;
			cursorGlow.classList.remove('active');
		});

		const animateGlow = () => {
			curX += (targetX - curX) * 0.18;
			curY += (targetY - curY) * 0.18;
			cursorGlow.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
			requestAnimationFrame(animateGlow);
		};
		requestAnimationFrame(animateGlow);
	}

	/* ---------- Magnetic buttons ---------- */
	if (canHover && !reduceMotion) {
		const MAX_PULL = 10;
		document.querySelectorAll('.btn').forEach((btn) => {
			btn.addEventListener('pointermove', (e) => {
				const rect = btn.getBoundingClientRect();
				const dx = e.clientX - (rect.left + rect.width / 2);
				const dy = e.clientY - (rect.top + rect.height / 2);
				btn.style.transition = 'transform .1s linear';
				btn.style.transform = `translate(${((dx / rect.width) * MAX_PULL).toFixed(1)}px, ${((dy / rect.height) * MAX_PULL).toFixed(1)}px)`;
			});
			btn.addEventListener('pointerleave', () => {
				btn.style.transition = 'transform .4s cubic-bezier(0.16,1,0.3,1)';
				btn.style.transform = 'translate(0, 0)';
			});
		});
	}

	/* ---------- 3D tilt on cards ---------- */
	if (canHover && !reduceMotion) {
		const MAX_TILT = 7;
		document.querySelectorAll('.skill-card, .contact-card, .info-card').forEach((card) => {
			card.addEventListener('pointermove', (e) => {
				const rect = card.getBoundingClientRect();
				const px = (e.clientX - rect.left) / rect.width - 0.5;
				const py = (e.clientY - rect.top) / rect.height - 0.5;
				card.style.transition = 'transform .08s linear';
				card.style.transform = `perspective(600px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) translateY(-4px)`;
			});
			card.addEventListener('pointerleave', () => {
				card.style.transition = 'transform .5s cubic-bezier(0.16,1,0.3,1)';
				card.style.transform = '';
			});
		});
	}

	/* ---------- Case-study accordion ---------- */
	document.querySelectorAll('.case-toggle').forEach((btn) => {
		btn.addEventListener('click', () => {
			const panel = document.getElementById(btn.getAttribute('aria-controls'));
			const isOpen = btn.getAttribute('aria-expanded') === 'true';
			btn.setAttribute('aria-expanded', String(!isOpen));
			if (panel) panel.classList.toggle('is-open', !isOpen);
		});
	});

	/* ---------- Network canvas (hero background) ---------- */
	const netCanvas = document.getElementById('net-canvas');
	const heroSection = netCanvas && netCanvas.closest('.hero');
	if (netCanvas && heroSection) {
		const ctx = netCanvas.getContext('2d');
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const ACCENT = '56, 189, 248';
		const ACCENT2 = '34, 211, 238';
		const LINK_DIST = 150;
		const POINTER_DIST = 170;
		let width = 0;
		let height = 0;
		let nodes = [];
		let netRaf = null;
		const pointer = { x: 0, y: 0, active: false };

		const makeNode = () => ({
			x: Math.random() * width,
			y: Math.random() * height,
			vx: (Math.random() - 0.5) * 0.18,
			vy: (Math.random() - 0.5) * 0.18,
			r: Math.random() * 1.6 + 1.2,
			pulse: Math.random() * Math.PI * 2,
		});

		const resizeNet = () => {
			const rect = heroSection.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
			netCanvas.width = Math.round(width * dpr);
			netCanvas.height = Math.round(height * dpr);
			netCanvas.style.width = `${width}px`;
			netCanvas.style.height = `${height}px`;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const count = Math.max(16, Math.min(46, Math.round((width * height) / 28000)));
			nodes = Array.from({ length: count }, makeNode);
		};

		const drawNet = () => {
			ctx.clearRect(0, 0, width, height);

			nodes.forEach((n) => {
				n.x += n.vx;
				n.y += n.vy;
				if (n.x < 0 || n.x > width) n.vx *= -1;
				if (n.y < 0 || n.y > height) n.vy *= -1;
				n.x = Math.max(0, Math.min(width, n.x));
				n.y = Math.max(0, Math.min(height, n.y));
			});

			for (let i = 0; i < nodes.length; i++) {
				for (let j = i + 1; j < nodes.length; j++) {
					const a = nodes[i];
					const b = nodes[j];
					const dist = Math.hypot(a.x - b.x, a.y - b.y);
					if (dist < LINK_DIST) {
						ctx.strokeStyle = `rgba(${ACCENT}, ${(1 - dist / LINK_DIST) * 0.35})`;
						ctx.lineWidth = 1;
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.stroke();
					}
				}
				if (pointer.active) {
					const dist = Math.hypot(nodes[i].x - pointer.x, nodes[i].y - pointer.y);
					if (dist < POINTER_DIST) {
						ctx.strokeStyle = `rgba(${ACCENT2}, ${(1 - dist / POINTER_DIST) * 0.55})`;
						ctx.lineWidth = 1.2;
						ctx.beginPath();
						ctx.moveTo(nodes[i].x, nodes[i].y);
						ctx.lineTo(pointer.x, pointer.y);
						ctx.stroke();
					}
				}
			}

			nodes.forEach((n) => {
				n.pulse += 0.02;
				const glow = (Math.sin(n.pulse) + 1) / 2;
				ctx.beginPath();
				ctx.fillStyle = `rgba(${ACCENT}, ${0.5 + glow * 0.4})`;
				ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
				ctx.fill();
			});

			if (pointer.active) {
				ctx.beginPath();
				ctx.fillStyle = `rgba(${ACCENT2}, 0.9)`;
				ctx.arc(pointer.x, pointer.y, 2.4, 0, Math.PI * 2);
				ctx.fill();
			}
		};

		const loop = () => {
			drawNet();
			netRaf = requestAnimationFrame(loop);
		};

		resizeNet();
		if (reduceMotion) {
			drawNet();
		} else {
			netRaf = requestAnimationFrame(loop);
		}

		window.addEventListener('resize', () => {
			resizeNet();
			if (reduceMotion) drawNet();
		}, { passive: true });

		heroSection.addEventListener('pointermove', (e) => {
			const rect = heroSection.getBoundingClientRect();
			pointer.x = e.clientX - rect.left;
			pointer.y = e.clientY - rect.top;
			pointer.active = true;
		});
		heroSection.addEventListener('pointerleave', () => {
			pointer.active = false;
		});
	}

	/* ---------- Interactive terminal ---------- */
	const termOutput = document.getElementById('term-output');
	const termInput = document.getElementById('term-input');
	const terminal = document.getElementById('hero-terminal');
	if (termOutput && termInput && terminal) {
		const history = [];
		let historyIndex = -1;

		const print = (text, cls) => {
			const line = document.createElement('div');
			line.className = `term-line${cls ? ` ${cls}` : ''}`;
			line.textContent = text;
			termOutput.appendChild(line);
			termOutput.scrollTop = termOutput.scrollHeight;
		};

		const printEcho = (cmd) => {
			const line = document.createElement('div');
			line.className = 'term-line cmd';
			line.textContent = cmd;
			termOutput.appendChild(line);
			termOutput.scrollTop = termOutput.scrollHeight;
		};

		const scrollToSection = (id) => {
			const el = document.getElementById(id);
			if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
		};

		const commands = {
			help() {
				print('Available commands:', 'accent');
				print('  about       — who I am');
				print('  skills      — what I work with');
				print('  projects    — jump to selected work');
				print('  contact     — how to reach me');
				print('  ping        — ping this site, just for fun');
				print('  whoami      — quick summary');
				print('  clear       — clear the screen');
			},
			about() {
				print('Network engineer based in Rajshahi, Bangladesh. I work across');
				print('Junos OS and Palo Alto environments — VPN architecture, firewall');
				print('policy, and automating the repetitive parts with Python & Bash.');
			},
			whoami() {
				print('abid — Network & Automation Engineer');
			},
			skills() {
				print('Networking : Junos OS, PAN-OS, VPN/IPsec, Network Security');
				print('Automation : Python, Bash, Expect/TCL, Multi-hop SSH, REST APIs');
				print('Web/Tooling: JavaScript, Three.js, Excel automation');
			},
			projects() {
				print('Opening Projects ↓', 'accent');
				scrollToSection('projects');
			},
			contact() {
				print('Opening Contact ↓', 'accent');
				print('email: abidmd.hossain@gmail.com');
				scrollToSection('contact');
			},
			clear() {
				termOutput.innerHTML = '';
			},
			ping() {
				print('PING abidhossain.dev — 3 hops, just for show 🙂', 'accent');
				const hops = ['hop 1  you            0.4 ms', 'hop 2  isp-gateway    11 ms', 'hop 3  abid-server    27 ms'];
				hops.forEach((h, i) => setTimeout(() => print(h), 220 * (i + 1)));
				setTimeout(() => print('Reply received. Say hi any time — try "contact".', 'accent'), 220 * (hops.length + 1));
			},
			sudo() {
				print('Permission denied: nice try 🙂', 'err');
			},
			date() {
				print(new Date().toString());
			},
		};

		const runCommand = (raw) => {
			const trimmed = raw.trim();
			printEcho(trimmed);
			if (!trimmed) return;
			history.push(trimmed);
			historyIndex = history.length;
			const [cmd, ...rest] = trimmed.split(/\s+/);
			const key = cmd.toLowerCase();
			if (key === 'echo') {
				print(rest.join(' '));
			} else if (commands[key]) {
				commands[key](rest);
			} else {
				print(`command not found: ${cmd} — type 'help'`, 'err');
			}
		};

		termInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				runCommand(termInput.value);
				termInput.value = '';
			} else if (e.key === 'ArrowUp') {
				if (history.length) {
					historyIndex = Math.max(0, historyIndex - 1);
					termInput.value = history[historyIndex] || '';
					e.preventDefault();
				}
			} else if (e.key === 'ArrowDown') {
				if (history.length) {
					historyIndex = Math.min(history.length, historyIndex + 1);
					termInput.value = history[historyIndex] || '';
					e.preventDefault();
				}
			}
		});

		terminal.addEventListener('click', () => termInput.focus());

		const boot = [
			['Connecting to abidhossain.dev ...', 'out'],
			['Session established.', 'accent'],
			["Type 'help' to see what this does.", 'out'],
		];
		boot.forEach(([text, cls], i) => {
			setTimeout(() => print(text, cls), reduceMotion ? 0 : 320 * (i + 1));
		});
	}
})();
