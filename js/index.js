const $chrome = document.querySelectorAll('.chrome')
const $firefox = document.querySelectorAll('.firefox')

if (navigator.userAgent.includes('Firefox')) {
	$chrome.forEach(e => e.classList.add('hidden'))
	$firefox.forEach(e => e.classList.remove('hidden'))
}