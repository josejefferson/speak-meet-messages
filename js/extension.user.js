// ==UserScript==
// @name         Escutar mensagens do Google Meet
// @version      0.7
// @description  Extensão que adiciona um recurso de falar em voz alta as novas mensagens no Google Meet
// @author       Jefferson Dantas
// @homepage     https://josejefferson.github.io/speak-meet-messages/
// @supportURL   https://github.com/josejefferson/speak-meet-messages/issues
// @updateURL    https://josejefferson.github.io/speak-meet-messages/js/extension.user.js
// @downloadURL  https://josejefferson.github.io/speak-meet-messages/js/extension.user.js
// @include      https://meet.google.com/*
// @include      https://josejefferson.github.io/speak-meet-messages/
// @include      http://localhost:8080/
// @icon         https://www.google.com/s2/favicons?domain=meet.google.com
// @grant        none
// ==/UserScript==

const options = {
	beforeText: lsget('option.beforeText') == null ? '' : lsget('option.beforeText'),
	speakName: lsget('option.speakName') == null ? true : lsget('option.speakName'),
	fullName: lsget('option.fullName') == null ? false : lsget('option.fullName'),
	nameAfter: lsget('option.nameAfter') == null ? true : lsget('option.nameAfter'),
	meetOpen: lsget('option.meetOpen') == null ? true : lsget('option.meetOpen'),
	interruptPrev: lsget('option.interruptPrev') == null ? false : lsget('option.interruptPrev'),
	voiceSpeed: lsget('option.voiceSpeed') == null ? 1.2 : lsget('option.voiceSpeed')
}

const selectors = {
	participantId: '[data-initial-participant-id]',
	beforeButton: '.SfBQ6c',
	msgBubble: '.NSvDmb',
	sender: '.UgDTGe',
	message: '.xtO4Tc'
}

let active = lsget('active')
const $button = document.createElement('button')

const $css = document.createElement('style')
$css.innerText = `
/* Botão de ativar/desativar extensão */
.speak-messages {
	align-items: center;
	background-color: #ea4335;
	border-radius: 50%;
	border: none;
	color: #fff;
	cursor: pointer;
	display: inline-flex;
	height: 40px;
	justify-content: center;
	margin: 0 6px;
	transition: .2s ease;
	user-select: none;
	vertical-align: middle;
	width: 40px;
}

.speak-messages .google-material-icons::before {
	content: 'volume_off';
}

.speak-messages.active {
	background-color: #3c4043;
}

.speak-messages.active .google-material-icons::before {
	content: 'volume_up';
}

.speak-messages:hover {
	box-shadow: 0 1px 2px 0 rgb(60 64 67 / 30%), 0 1px 3px 1px rgb(60 64 67 / 15%);
}

.speak-messages:disabled {
	color: rgba(232, 234, 237, 0.38);
	opacity: .25;
	pointer-events: none;
}


/* Fundo do popup de opções */
.popup-background {
	background-color: rgba(0, 0, 0, 0.6);
	display: flex;
	height: 100%;
	left: 0;
	opacity: 0;
	pointer-events: none;
	position: fixed;
	top: 0;
	transition: opacity .2s ease;
	width: 100%;
	z-index: 1;
}

.popup-background.show {
	opacity: 1;
	pointer-events: all;
}

/* Popup de opções */
.popup-background .popup {
	background: white;
	border-radius: 8px;
	box-shadow: 0 1px 3px 0 rgb(60 64 67 / 30%), 0 4px 8px 3px rgb(60 64 67 / 15%);
	display: flex;
	flex-direction: column;
	margin: auto;
	max-height: calc(100% - 20px);
	max-width: calc(100% - 20px);
	overflow: hidden;
	transform: translateY(75%) scale(0.8);
	transition: transform 0s ease .2s;
	user-select: none;
	width: 50rem;
}

.popup-background.show .popup {
	transform: translateY(0) scale(1);
	transition: transform .3s ease;
}

.popup-background .popup header {
	align-items: center;
	border-bottom: 1px solid #e8eaed;
	display: flex;
	padding: 0 24px;
}

.popup-background .popup header h1 {
	display: inline-block;
	flex: 1;
	font-family: "Google Sans", Roboto, Arial, sans-serif;
	font-size: 1.375rem;
	font-weight: 400;
	letter-spacing: 0;
	line-height: 1.75rem;
	margin: 24px 0;
}

.popup-background .popup header .close-settings {
	align-items: center;
	background-color: transparent;
	border-radius: 50%;
	border: none;
	color: rgba(0, 0, 0, 0.54);
	cursor: pointer;
	display: flex;
	height: 48px;
	justify-content: center;
	margin: -12px -16px;
	transition: .15s ease;
	width: 48px;
}

.popup-background .popup header .close-settings:active,
.popup-background .popup header .close-settings:focus {
	background-color: rgba(0, 0, 0, 0.12);
}

.popup-background .popup .content {
	overflow: auto;
	padding: 0 24px 24px 24px;
}

.popup-background .popup .content .option {
	display: flex;
	margin-top: 18px;
}

.popup-background .popup .content .option:active .checkbox {
	background-color: rgba(0, 0, 0, 0.12);
}

.popup-background .popup .content .option .details {
	flex: 1;
}

.popup-background .popup .content .option .details h4 {
	flex: 1;
	font-family: Roboto, Arial, sans-serif;
	font-size: 1rem;
	font-weight: 400;
	letter-spacing: .00625em;
	line-height: 1.5rem;
	margin: 0;
}

.popup-background .popup .content .option .details p {
	color: #5f6368;
	font-family: Roboto, Arial, sans-serif;
	font-size: .875rem;
	font-weight: 400;
	letter-spacing: .01428571em;
	line-height: 1.25rem;
	margin: 0;
}

.popup-background .popup .content .option input[type="checkbox"] {
	opacity: 0;
	z-index: -1;
	pointer-events: none;
	position: absolute;
	outline: none;
}

.popup-background .popup .content .option .checkbox {
	align-items: center;
	background-color: transparent;
	border-radius: 50%;
	color: rgba(0, 0, 0, 0.54);
	cursor: pointer;
	cursor: pointer;
	display: flex;
	height: 48px;
	justify-content: center;
	transition: .15s ease;
	width: 48px;
}

.popup-background .popup .content .option .checkbox::before {
	content: 'check_box_outline_blank';
}

.popup-background .popup .content .option input[type="checkbox"]:checked+.checkbox::before {
	content: 'check_box';
	color: #1a73e8;
}

.popup-background .popup .content .option input {
	align-self: center;
	border-radius: 4px;
	border: rgba(0, 0, 0, .38) 1px solid;
	box-sizing: border-box;
	color: rgba(0, 0, 0, .87);
	font-family: Roboto, Arial, sans-serif;
	font-size: 1rem;
	font-weight: 400;
	letter-spacing: .009375em;
	line-height: 20px;
	margin-left: 28px;
	margin-right: 14px;
	outline: none;
	padding: 12px 16px 14px;
	transition: .15s ease;
}

.popup-background .popup .content .option input:focus {
	border-color: #1a73e8;
	border-width: 2px;
	padding: 11px 15px 14px;
}

/* Switch */
.switch {
	display: inline-block;
	position: relative;
}

.switch input {
	opacity: 0;
	outline: none;
	pointer-events: none;
	position: absolute;
	z-index: -1;
}

.switch span {
	cursor: pointer;
	display: inline-block;
	width: 100%;
}

.switch span::before {
	background-color: black;
	border-radius: 1000px;
	content: '';
	display: inline-block;
	height: 14px;
	margin: 17px 18px;
	opacity: .38;
	transition: background-color 0.2s, opacity 0.2s;
	width: 32px;
}

.switch span::after {
	--darkreader-bg--gm-switch-thumb-color--off: #fff;
	background-color: var(--gm-switch-thumb-color--off, #fff);
	border-radius: 50%;
	box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
		0px 2px 2px 0px rgb(0 0 0 / 14%),
		0px 1px 5px 0px rgb(0 0 0 / 12%),
		0 0 0 14px rgba(0, 0, 0, 0),
		0 0 0 0 rgba(0, 0, 0, 0.24);
	content: '';
	height: 20px;
	left: 14px;
	position: absolute;
	top: 14px;
	transition: background-color 0.2s, left 0.2s, box-shadow .2s;
	width: 20px;
}

.switch:hover span::after {
	box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
		0px 2px 2px 0px rgb(0 0 0 / 14%),
		0px 1px 5px 0px rgb(0 0 0 / 12%),
		0 0 0 14px rgba(158, 158, 158, 0.08);
}

.switch input:focus+span::after,
.switch:active span::after {
	box-shadow: 0px 3px 1px -2px rgb(0 0 0 / 20%),
		0px 2px 2px 0px rgb(0 0 0 / 14%),
		0px 1px 5px 0px rgb(0 0 0 / 12%),
		0 0 0 14px rgba(158, 158, 158, 0.24);
}

.switch input:checked+span::before {
	background-color: var(--gm-switch-track-color--on, #4285f4);
}

.switch input:checked+span::after {
	background-color: var(--gm-switch-thumb-color--on, #1a73e8);
	left: 34px;
}

.switch:focus span::after {
	box-shadow: rgba(0, 0, 0, 0.3) 0 0 0 5px;
}`

/*
const popupOptionsHTML = `
<div class="popup">
	<header>
		<h1>Opções</h1>
		<button class="close-settings">
			<i class="google-material-icons">close</i>
		</button>
	</header>

	<div class="content">

		<label class="option">
			<div class="details">
				<h4>Texto antes da mensagem</h4>
				<p>Diz alguma expressão antes de cada mensagem, por exemplo: "Nova mensagem!"</p>
			</div>
			<input type="text" style="width:230px" id="beforeText">
		</label>

		<label class="option">
			<div class="details">
				<h4>Dizer nome</h4>
				<p>Diz o nome do usuário que enviou a mensagem</p>
			</div>
			<div class="switch">
				<input type="checkbox" id="speakName">
				<span></span>
			</div>
		</label>

		<label class="option">
			<div class="details">
				<h4>Dizer nome completo</h4>
				<p>Se desativado, diz apenas 2 palavras do nome do usuário</p>
			</div>
			<div class="switch">
				<input type="checkbox" id="fullName">
				<span></span>
			</div>
		</label>

		<label class="option">
			<div class="details">
				<h4>Dizer nome depois da mensagem</h4>
				<p>Diz o nome do usuário depois da mensagem, caso contrário, diz antes dela</p>
			</div>
			<div class="switch">
				<input type="checkbox" id="nameAfter">
				<span></span>
			</div>
		</label>

		<label class="option">
			<div class="details">
				<h4>Falar com a tela do Meet aberta</h4>
				<p>Se desativado, diz a mensagem apenas quando a tela do Meet não está visível</p>
			</div>
			<div class="switch">
				<input type="checkbox" id="meetOpen">
				<span></span>
			</div>
		</label>

		<label class="option">
			<div class="details">
				<h4>Interromper mensagem anterior</h4>
				<p>Quando uma nova mensagem chegar, a fala da anterior será interrompida</p>
			</div>
			<div class="switch">
				<input type="checkbox" id="interruptPrev">
				<span></span>
			</div>
		</label>

		<label class="option">
			<div class="details">
				<h4>Velocidade da voz</h4>
				<p>Ajusta a velocidade da voz, exemplo: 0,5 mais lento, 1,5 mais rápido</p>
			</div>
			<input type="number" min="0" max="2" step="0.1" style="width:80px" id="voiceSpeed">
		</label>

	</div><!-- .content -->
</div><!-- .popup -->`
*/

// Código HTML acima convertido pelo site: https://html2js.esstudio.site/
function createPopupOptions() {
	const e_0 = document.createElement('div')
	e_0.setAttribute('class', 'popup')
	const e_1 = document.createElement('header')
	const e_2 = document.createElement('h1')
	e_2.appendChild(document.createTextNode('Opções'))
	e_1.appendChild(e_2)
	const e_3 = document.createElement('button')
	e_3.setAttribute('class', 'close-settings')
	const e_4 = document.createElement('i')
	e_4.setAttribute('class', 'google-material-icons')
	e_4.appendChild(document.createTextNode('close'))
	e_3.appendChild(e_4)
	e_1.appendChild(e_3)
	e_0.appendChild(e_1)
	const e_5 = document.createElement('div')
	e_5.setAttribute('class', 'content')
	const e_6 = document.createElement('label')
	e_6.setAttribute('class', 'option')
	const e_7 = document.createElement('div')
	e_7.setAttribute('class', 'details')
	const e_8 = document.createElement('h4')
	e_8.appendChild(document.createTextNode('Texto antes da mensagem'))
	e_7.appendChild(e_8)
	const e_9 = document.createElement('p')
	e_9.appendChild(document.createTextNode('Diz alguma expressão antes de cada mensagem, por exemplo: "Nova mensagem!"'))
	e_7.appendChild(e_9)
	e_6.appendChild(e_7)
	const e_10 = document.createElement('input')
	e_10.setAttribute('type', 'text')
	e_10.setAttribute('style', 'width:230px')
	e_10.setAttribute('id', 'beforeText')
	e_6.appendChild(e_10)
	e_5.appendChild(e_6)
	const e_11 = document.createElement('label')
	e_11.setAttribute('class', 'option')
	const e_12 = document.createElement('div')
	e_12.setAttribute('class', 'details')
	const e_13 = document.createElement('h4')
	e_13.appendChild(document.createTextNode('Dizer nome'))
	e_12.appendChild(e_13)
	const e_14 = document.createElement('p')
	e_14.appendChild(document.createTextNode('Diz o nome do usuário que enviou a mensagem'))
	e_12.appendChild(e_14)
	e_11.appendChild(e_12)
	const e_15 = document.createElement('div')
	e_15.setAttribute('class', 'switch')
	const e_16 = document.createElement('input')
	e_16.setAttribute('type', 'checkbox')
	e_16.setAttribute('id', 'speakName')
	e_15.appendChild(e_16)
	const e_17 = document.createElement('span')
	e_15.appendChild(e_17)
	e_11.appendChild(e_15)
	e_5.appendChild(e_11)
	const e_18 = document.createElement('label')
	e_18.setAttribute('class', 'option')
	const e_19 = document.createElement('div')
	e_19.setAttribute('class', 'details')
	const e_20 = document.createElement('h4')
	e_20.appendChild(document.createTextNode('Dizer nome completo'))
	e_19.appendChild(e_20)
	const e_21 = document.createElement('p')
	e_21.appendChild(document.createTextNode('Se desativado, diz apenas 2 palavras do nome do usuário'))
	e_19.appendChild(e_21)
	e_18.appendChild(e_19)
	const e_22 = document.createElement('div')
	e_22.setAttribute('class', 'switch')
	const e_23 = document.createElement('input')
	e_23.setAttribute('type', 'checkbox')
	e_23.setAttribute('id', 'fullName')
	e_22.appendChild(e_23)
	const e_24 = document.createElement('span')
	e_22.appendChild(e_24)
	e_18.appendChild(e_22)
	e_5.appendChild(e_18)
	const e_25 = document.createElement('label')
	e_25.setAttribute('class', 'option')
	const e_26 = document.createElement('div')
	e_26.setAttribute('class', 'details')
	const e_27 = document.createElement('h4')
	e_27.appendChild(document.createTextNode('Dizer nome depois da mensagem'))
	e_26.appendChild(e_27)
	const e_28 = document.createElement('p')
	e_28.appendChild(document.createTextNode('Diz o nome do usuário depois da mensagem, caso contrário, diz antes dela'))
	e_26.appendChild(e_28)
	e_25.appendChild(e_26)
	const e_29 = document.createElement('div')
	e_29.setAttribute('class', 'switch')
	const e_30 = document.createElement('input')
	e_30.setAttribute('type', 'checkbox')
	e_30.setAttribute('id', 'nameAfter')
	e_29.appendChild(e_30)
	const e_31 = document.createElement('span')
	e_29.appendChild(e_31)
	e_25.appendChild(e_29)
	e_5.appendChild(e_25)
	const e_32 = document.createElement('label')
	e_32.setAttribute('class', 'option')
	const e_33 = document.createElement('div')
	e_33.setAttribute('class', 'details')
	const e_34 = document.createElement('h4')
	e_34.appendChild(document.createTextNode('Falar com a tela do Meet aberta'))
	e_33.appendChild(e_34)
	const e_35 = document.createElement('p')
	e_35.appendChild(document.createTextNode('Se desativado, diz a mensagem apenas quando a tela do Meet não está visível'))
	e_33.appendChild(e_35)
	e_32.appendChild(e_33)
	const e_36 = document.createElement('div')
	e_36.setAttribute('class', 'switch')
	const e_37 = document.createElement('input')
	e_37.setAttribute('type', 'checkbox')
	e_37.setAttribute('id', 'meetOpen')
	e_36.appendChild(e_37)
	const e_38 = document.createElement('span')
	e_36.appendChild(e_38)
	e_32.appendChild(e_36)
	e_5.appendChild(e_32)
	const e_39 = document.createElement('label')
	e_39.setAttribute('class', 'option')
	const e_40 = document.createElement('div')
	e_40.setAttribute('class', 'details')
	const e_41 = document.createElement('h4')
	e_41.appendChild(document.createTextNode('Interromper mensagem anterior'))
	e_40.appendChild(e_41)
	const e_42 = document.createElement('p')
	e_42.appendChild(document.createTextNode('Quando uma nova mensagem chegar, a fala da anterior será interrompida'))
	e_40.appendChild(e_42)
	e_39.appendChild(e_40)
	const e_43 = document.createElement('div')
	e_43.setAttribute('class', 'switch')
	const e_44 = document.createElement('input')
	e_44.setAttribute('type', 'checkbox')
	e_44.setAttribute('id', 'interruptPrev')
	e_43.appendChild(e_44)
	const e_45 = document.createElement('span')
	e_43.appendChild(e_45)
	e_39.appendChild(e_43)
	e_5.appendChild(e_39)
	const e_46 = document.createElement('label')
	e_46.setAttribute('class', 'option')
	const e_47 = document.createElement('div')
	e_47.setAttribute('class', 'details')
	const e_48 = document.createElement('h4')
	e_48.appendChild(document.createTextNode('Velocidade da voz'))
	e_47.appendChild(e_48)
	const e_49 = document.createElement('p')
	e_49.appendChild(document.createTextNode('Ajusta a velocidade da voz, exemplo: 0,5 mais lento, 1,5 mais rápido'))
	e_47.appendChild(e_49)
	e_46.appendChild(e_47)
	const e_50 = document.createElement('input')
	e_50.setAttribute('type', 'number')
	e_50.setAttribute('min', '0')
	e_50.setAttribute('max', '2')
	e_50.setAttribute('step', '0.1')
	e_50.setAttribute('style', 'width:80px')
	e_50.setAttribute('id', 'voiceSpeed')
	e_46.appendChild(e_50)
	e_5.appendChild(e_46)
	e_0.appendChild(e_5)
	return e_0
}

const $popupOptions = createPopupOptions()

tryStart()
function tryStart() {
	if (document.querySelector(selectors.participantId)) {
		start()
	}
	else {
		setTimeout(tryStart, 1000)
	}
}


function start() {
	// Configura o botão
	$button.title = 'Ativar/desativar mensagens em voz alta\nClique com o botão direito para opções'
	$button.classList.add('speak-messages')
	const $buttonIcon = document.createElement('i')
	$buttonIcon.classList.add('google-material-icons')
	$button.appendChild($buttonIcon)

	// Insere o botão de ativar/desativar
	const $before = document.querySelector(selectors.beforeButton)
	if ($before) {
		$before.parentNode.insertBefore($button, $before.nextElementSibling)
		$before.parentNode.insertBefore($css, $before.nextElementSibling)
	}

	// Insere o popup de opções
	const $popup = document.createElement('div')
	$popup.classList.add('popup-background')
	$popup.appendChild($popupOptions)
	document.body.appendChild($popup)
	setupOptions($popup)

	function openOptions(e) {
		e.preventDefault()
		$popup.classList.add('show')
		return false
	}

	// Voz não suportada
	if (!('speechSynthesis' in window)) {
		$button.disabled = true
		$button.title = 'Seu dispositivo não suporta mensagens em voz alta'
		return
	}

	getVoice(voice => {
		// Não há voz disponível
		if (!voice) {
			$button.disabled = true
			$button.title = 'Seu dispositivo não suporta mensagens em voz alta'
			return
		}

		// Configura o botão
		if (active) $button.classList.add('active')
		$button.addEventListener('click', toggle)
		$button.addEventListener('contextmenu', openOptions)

		watchMessages(voice)
	})
}

// Retorna voz disponível
function getVoice(callback) {
	speechSynthesis.getVoices()
	setTimeout(() => {
		const voices = speechSynthesis.getVoices()
		let voice = voices.find(voice => {
			return voice.name === 'Google português do Brasil'
		}) || voices.find(voice => {
			return voice.lang.toLowerCase().includes('pt-br')
		})

		callback(voice)
	}, 2000)
}

// Ativa/desativa a voz
function toggle() {
	active = !active
	$button.classList[active ? 'add' : 'remove']('active')
	lsset('active', active)
	stopSpeak()
}

// Aguarda por mensagens
function watchMessages(voice) {
	const observer = new MutationObserver((mutationRecord) => {
		const messageElement = mutationRecord[mutationRecord.length - 1].addedNodes[0]

		if (messageElement && active && (options.meetOpen || document.hidden)) {
			let sender = messageElement.querySelector(selectors.sender).innerText
			if (!options.fullName) {
				sender = sender.split(' ')
				if (sender[1].length <= 2) sender = sender.slice(0, 3).join(' ')
				else sender = sender.slice(0, 2).join(' ')
			}

			const message = messageElement.querySelector(selectors.message).innerText

			let phrase = options.beforeText + ' '

			if (options.nameAfter) {
				phrase += message
				if (options.speakName) phrase += ', disse ' + sender
			}
			else {
				if (options.speakName) phrase += sender + 'disse, '
				phrase += message
			}

			speak(phrase, options.voiceSpeed || 1.2, voice)
		}
	})

	const $msgBubble = document.querySelector(selectors.msgBubble)
	observer.observe($msgBubble, { childList: true, subtree: true })
}

// Fala a mensagem
function speak(message, speed, voice) {
	if (options.interruptPrev) stopSpeak()

	const utterance = new SpeechSynthesisUtterance()
	utterance.text = message
	utterance.lang = 'pt-BR'
	utterance.voice = voice
	utterance.rate = speed

	speechSynthesis.speak(utterance)
}

// Para de falar
function stopSpeak() {
	speechSynthesis.cancel()
}

// Configurar o popup de opções
function setupOptions($popup) {
	$popup.addEventListener('click', e => {
		if (e.target == $popup) closePopup()
	})

	$popup.querySelector('.close-settings').addEventListener('click', closePopup)

	for (let option in options) {
		const $option = $popup.querySelector('#' + option)
		if (!$option) continue

		const value = options[option]
		if (typeof value == 'boolean') {
			$option.checked = value
		} else {
			$option.value = value
		}

		$option.addEventListener('change', (e) => {
			const checkbox = e.target.type == 'checkbox'
			if (checkbox) {
				lsset('option.' + option, e.target.checked)
				options[option] = e.target.checked
			} else {
				lsset('option.' + option, e.target.value)
				options[option] = e.target.value
			}
		})
	}

	function closePopup() {
		$popup.classList.remove('show')
	}
}

// Definir um valor no armazenamento
function lsset(name, value) {
	return localStorage.setItem('speak-messages.' + name, value)
}

// Consultar um valor no armazenamento
function lsget(name) {
	const value = localStorage.getItem('speak-messages.' + name)
	if (value == '') return ''
	if (value == 'true') return true
	if (value == 'false') return false
	if (value == null) return null
	if (!isNaN(value)) return Number(value)
	return value
}

console.log(
	'%c🎤 Escutar mensagens do Meet%cv' + GM_info.script.version,
	'background-color:#06f;border-radius:99px;color:#fff;font-family:Roboto,sans-serif;margin-right:5px;padding:5px 10px',
	'background-color:#f71;border-radius:99px;color:#fff;font-family:Roboto,Arial,sans-serif;padding:5px 10px'
)

window.speakMeetMessagesInstalled = true
window.speakMeetMessagesVersion = GM_info.script.version