const CURRENT_VERSION = '0.7'

const LS_WAIT_INSTALL = 'speakMeetMessages.waitInstall'
const LS_LAST_VERSION = 'speakMeetMessages.lastVersion'

const $chrome = document.querySelectorAll('.chrome')
const $firefox = document.querySelectorAll('.firefox')
const $install = document.querySelectorAll('.install')
const $installed = document.querySelector('.installed')
const $updateAvailable = document.querySelector('.update-available')
const $version = document.querySelectorAll('.version')
const $newVersion = document.querySelectorAll('.new-version')

if (navigator.userAgent.includes('Firefox')) {
	$chrome.forEach(e => e.classList.add('hidden'))
	$firefox.forEach(e => e.classList.remove('hidden'))
}

$install.forEach(e => e.addEventListener('click', () => {
	console.log('click')
	document.addEventListener('visibilitychange', () => {
		console.log(document.hidden)
		if (!document.hidden) {
			// Detecta quando a extensão é instalada
			localStorage.setItem(LS_WAIT_INSTALL, true)
			const version = window.speakMeetMessagesVersion
			if (version) {
				localStorage.setItem(LS_LAST_VERSION, version)
			}
			location.reload()
		}
	})
}))

window.addEventListener('load', () => {
	setTimeout(() => {
		const installed = window.speakMeetMessagesInstalled
		const version = window.speakMeetMessagesVersion

		if (installed) {
			// Extensão instalada
			$version.forEach(e => e.innerText = version)
			$install[0].classList.add('btn-success')
			$install[0].querySelector('span').innerText = 'Reinstalar extensão'
			$installed.classList.remove('hidden')

			if (version !== CURRENT_VERSION) {
				// Nova atualização disponível
				$installed.classList.add('hidden')
				$install[0].classList.add('btn-danger')
				$install[0].querySelector('span').innerText = 'Atualizar extensão'
				$newVersion.forEach(e => e.innerText = CURRENT_VERSION)
				$updateAvailable.classList.remove('hidden')
			}

		}

		if (localStorage.getItem(LS_WAIT_INSTALL)) {
			if (installed) {
				// Sucesso na instalação
				localStorage.setItem(LS_LAST_VERSION, version)
				Swal.fire({
					toast: true,
					position: 'top-end',
					showConfirmButton: false,
					timer: 5000,
					icon: 'success',
					text: 'Instalação concluída',
				})
			}
			localStorage.removeItem(LS_WAIT_INSTALL)
		}
	}, 100)

	if ('VisitorCounter' in window) VisitorCounter({
		elements: {
			urlAll: '.total-users'
		}
	})
})