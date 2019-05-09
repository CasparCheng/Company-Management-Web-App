"use strict";

var signupForm = document.getElementById('signup-form');
var loginForm = document.getElementById('login-form');
var resetPasswordForm = document.getElementById('reset-password-form');

var signupBtn = document.getElementById('signup-btn');
var signupDialogModal = document.getElementById('signup-dialog-modal');

var resetPasswordLink = document.getElementById('reset-password-link');
var resetPasswordDialogModal = document.getElementById('reset-password-dialog-modal');

var searchboxForm = document.getElementById('searchbox-form');
var searchResultsModal = document.getElementById('search-results-modal');
var searchResultsContainer = document.getElementById('search-results');
var searchResultTemplate = document.getElementById('search-result-template');


$(searchboxForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/search',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        var html = '';
        var results = data.results;
        if (results.length != 0) {
            for (var result of results) {
                html += Mustache.to_html(
                    searchResultTemplate.innerHTML, result
                );
            }
        } else {
            html = '<div class="prompt">No entries yet ...</div>';
        }
        searchResultsContainer.innerHTML = html;
        searchResultsModal.style.display = 'block';
    }).fail(function (data) {
        console.log(data);
        alert(data.responseText);
    });

    e.preventDefault();
});

$(signupForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/signup',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        signupDialogModal.style.display = 'none';
        window.location = data;
    }).fail(function (data) {
        console.log(data);
        alert(data.responseText);
    });

    e.preventDefault();
});

$(loginForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/login',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        window.location = data;
    }).fail(function (data) {
        console.log(data);
        alert(data.responseText);
    });

    e.preventDefault();
});

$(resetPasswordForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/reset-password',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        resetPasswordDialogModal.style.display = 'none';
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.responseText);
    });

    e.preventDefault();
});

signupBtn.onclick = function () {
    signupDialogModal.style.display = 'block';
};

window.onclick = function (evt) {
    if (evt.target == signupDialogModal) {
        signupDialogModal.style.display = 'none';
    } else if (evt.target == resetPasswordDialogModal) {
        resetPasswordDialogModal.style.display = 'none';
    } else if (evt.target == searchResultsModal) {
        searchResultsModal.style.display = 'none';
    }
};

resetPasswordLink.onclick = function () {
    resetPasswordDialogModal.style.display = 'block';
};