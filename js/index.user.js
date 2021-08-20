// ==UserScript==
// @name         Falar mensagens do Google Meet
// @version      0.1
// @description  Falar mensagens do Google Meet
// @author       Jefferson Dantas
// @match        https://meet.google.com/*
// @icon         https://www.google.com/s2/favicons?domain=meet.google.com
// @grant        none
// @require      https://josejefferson.github.io/speak-meet-messages/js/index.js
// ==/UserScript==



// Diz alguma expressão antes de cada mensagem, por exemplo: "Nova mensagem!"
const Texto_para_falar_antes_da_mensagem = ""

// Se true, fala o nome da pessoa que enviou a mensagem
const Falar_nome = true

// Se false, fala apenas 2 palavras do nome da pessoa
const Falar_nome_completo = false

// Se true, fala o nome da pessoa depois da mensagem, se false fala antes da mensagem
const Falar_nome_depois_da_mensagem = true

// Se false, fala a mensagem apenas quando a tela do Meet não está visível
const Falar_com_a_tela_do_Meet_aberta = false

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