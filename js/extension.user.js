// ==UserScript==
// @name         Escutar mensagens do Google Meet
// @version      0.1
// @description  Extensão que adiciona um recurso de falar em voz alta as novas mensagens no Google Meet
// @author       Jefferson Dantas
// @homepage     https://josejefferson.github.io/speak-meet-messages/
// @supportURL   https://github.com/josejefferson/speak-meet-messages/issues
// @match        https://meet.google.com/*
// @icon         https://www.google.com/s2/favicons?domain=meet.google.com
// @grant        none
// ==/UserScript==

// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃          CONFIGURAÇÕES          ┃
// ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
// ┃ "true" significa "Sim"          ┃
// ┃ "false" significa "Não"         ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

// Diz alguma expressão antes de cada mensagem, por exemplo: "Nova mensagem!"
const Texto_para_falar_antes_da_mensagem = ""

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
window.speakMessagesOptions = {
	beforeText: Texto_para_falar_antes_da_mensagem, //
	speakName: Falar_nome, //
	fullName: Falar_nome_completo,//
	nameAfter: Falar_nome_depois_da_mensagem,//
	meetOpen: Falar_com_a_tela_do_Meet_aberta,
	interruptPrev: Interromper_mensagem_anterior,
	voiceSpeed: Velocidade_da_fala//
}

fetch('https://josejefferson.github.io/speak-meet-messages/js/extension.js')
	.then(r => r.text())
	.then(r => eval(r))