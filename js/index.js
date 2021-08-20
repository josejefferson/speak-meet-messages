let active = localStorage.getItem('speak-messages.active') === 'true'
const $button = document.createElement('button')
const options = window.speakMessagesOptions

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

	.speak-messages.active {
		background-color: #3c4043;
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
	$button.innerHTML += '<i class="google-material-icons">record_voice_over</i>'
	$button.title = 'Ativar/desativar mensagens em voz alta'
	$button.classList.add('speak-messages')

	// Insere o botão de ativar/desativar
	const $before = document.querySelector(selectors.beforeButton)
	if ($before) {
		$before.parentNode.insertBefore($button, $before.nextElementSibling)
		$before.parentNode.insertBefore($css, $before.nextElementSibling)
	}

	// Voz não suportada
	if (!'speechSynthesis' in window) {
		$button.disabled = true
		$button.title = 'Seu dispositivo não suporta mensagens em voz alta'
		return
	}

	// Não há voz disponível
	const voice = getVoice(voice => {
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
	}, 1000)
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
				if (speakName) phrase += ', disse ' + sender
			}
			else {
				if (speakName) phrase += sender + 'disse, '
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