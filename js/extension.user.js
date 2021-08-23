// ==UserScript==
// @name         Escutar mensagens do Google Meet
// @version      0.2
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

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃          CONFIGURAÇÕES          ┃
// ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
// ┃ "true" significa "Sim"          ┃
// ┃ "false" significa "Não"         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// Diz alguma expressão antes de cada mensagem, por exemplo: 'Nova mensagem!'
const Texto_para_falar_antes_da_mensagem = ''

// Se true, fala o nome da pessoa que enviou a mensagem
const Falar_nome = true

// Se false, fala apenas 2 palavras do nome da pessoa
const Falar_nome_completo = false

// Se true, fala o nome da pessoa depois da mensagem, se false fala antes da mensagem
const Falar_nome_depois_da_mensagem = true

// Se false, fala a mensagem apenas quando a tela do Meet não está visível
const Falar_com_a_tela_do_Meet_aberta = true

// Se true, quando uma nova mensagem chegar, a fala da anterior será interrompida
const Interromper_mensagem_anterior = false

// Ajuste a velocidade da fala, exemplo: 0.5 fala mais lenta, 1.5 fala mais rápida
const Velocidade_da_fala = 1.2






























































































































// NÃO MEXER ABAIXO
const options = {
	beforeText: Texto_para_falar_antes_da_mensagem,
	speakName: Falar_nome,
	fullName: Falar_nome_completo,
	nameAfter: Falar_nome_depois_da_mensagem,
	meetOpen: Falar_com_a_tela_do_Meet_aberta,
	interruptPrev: Interromper_mensagem_anterior,
	voiceSpeed: Velocidade_da_fala
}

let active = localStorage.getItem('speak-messages.active') === 'true'
const $button = document.createElement('button')

const selectors = {
	participantId: '[data-initial-participant-id]',
	beforeButton: '.iJq2Ce',
	msgBubble: '.NSvDmb',
	sender: '.UgDTGe',
	message: '.xtO4Tc'
}

const $css = document.createElement('style')
$css.innerText = `
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
`

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
	$button.innerHTML += '<i class="google-material-icons"></i>'
	$button.title = 'Ativar/desativar mensagens em voz alta'
	$button.classList.add('speak-messages')

	// Insere o botão de ativar/desativar
	const $before = document.querySelector(selectors.beforeButton)
	if ($before) {
		$before.parentNode.insertBefore($button, $before.nextElementSibling)
		$before.parentNode.insertBefore($css, $before.nextElementSibling)
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

		watchMessages(voice)
	})
}


// Retorna voz disponível
function getVoice(callback) {
	speechSynthesis
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
	localStorage.setItem('speak-messages.active', active)
	stopSpeak()
}


// Aguarda por mensagens
function watchMessages(voice) {
	const observer = new MutationObserver((mutationRecord) => {
		const messageElement = mutationRecord[mutationRecord.length - 1].addedNodes[0]

		if (messageElement && active && (options.meetOpen || document.hidden)) {
			let sender = messageElement.querySelector(selectors.sender).innerText
			sender = options.fullName ? sender : sender.split(' ').slice(0, 2).join(' ')

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

console.log(
	'%c🎤 Escutar mensagens do Meet%cv' + GM_info.script.version,
	'background-color:#06f;border-radius:99px;color:#fff;font-family:Roboto,sans-serif;margin-right:5px;padding:5px 10px',
	'background-color:#f71;border-radius:99px;color:#fff;font-family:Roboto,Arial,sans-serif;padding:5px 10px'
)

window.speakMeetMessagesInstalled = true
window.speakMeetMessagesVersion = GM_info.script.version