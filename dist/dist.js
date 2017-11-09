(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

document.addEventListener("DOMContentLoaded", function (event) {

  var workingNote;

  var permissions = [{
    name: "stream-context-item"
  }];

  var componentManager = new ComponentManager(permissions, function () {
    // on ready
  });

  var ignoreTextChange = false;
  var initialLoad = true;
  var lastValue;

  componentManager.streamContextItem(function (note) {

    workingNote = note;

    if (!window.simplemde) {
      return;
    }

    if (note.content.text !== lastValue) {
      ignoreTextChange = true;
      window.simplemde.value(note.content.text);
      ignoreTextChange = false;
    }

    if (initialLoad) {
      initialLoad = false;
      window.simplemde.codemirror.getDoc().clearHistory();
    }
  });

  window.simplemde = new SimpleMDE({
    element: document.getElementById("editor"),
    spellChecker: false,
    status: false,
    toolbar: ["heading", "bold", "italic", "strikethrough", "|", "quote", "code", "|", "unordered-list", "ordered-list", "|", "clean-block", "|", "link", "image", "|", "table", "|", "preview", "side-by-side", "fullscreen"]
  });

  window.simplemde.toggleFullScreen();

  simplemde.codemirror.on("change", function () {
    if (!ignoreTextChange) {
      lastValue = simplemde.value();
      workingNote.content.text = lastValue;
      componentManager.saveItem(workingNote);
    }
  });
});


},{}]},{},[1]);
