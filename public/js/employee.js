'use strict';

var numNewNotifications = document.getElementById('num-of-new-notifications');
var notificationBtn = document.getElementById('notification');
var notificationModal = document.getElementById('notification-modal');
var notifsContainer = document.getElementById('notifs');

var profileSwitch = document.getElementById('profile-switch');
var allGroupsSwitch = document.getElementById('all-groups-switch');
var allTasksSwitch = document.getElementById('all-tasks-switch');
var allAnnsSwitch = document.getElementById('all-anns-switch');

var profile = document.getElementById('profile');
var allGroups = document.getElementById('all-groups');
var allTasks = document.getElementById('all-tasks');
var allAnns = document.getElementById('all-anns');

var profileForm = document.getElementById('profile-form');
var usernameInp = profileForm.querySelector('#username-profile');
var addressInp = profileForm.querySelector('#address-profile');
var emailInp = profileForm.querySelector('#email-profile');
var phoneInp = profileForm.querySelector('#phone-profile');
var belongsToInp = profileForm.querySelector('#belongs-to-profile');

var companyOptTemplate = document.getElementById('company-opt-template');

var notifTemplate = document.getElementById('notif-template');

var allGroupsContainer = document.getElementById('groups');
var groupTemplate = document.getElementById('group-template');

var allTasksContainer = document.getElementById('tasks');
var taskTemplate = document.getElementById('task-template');

var allAnnsContainer = document.getElementById('anns');
var annTemplate = document.getElementById('ann-template');


$(profileForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/employee/profile',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });

    e.preventDefault();
});

function deactivateAll() {
    var activeSwitches = document.querySelectorAll('.switch.active');
    for (var activeSwitch of activeSwitches) {
        activeSwitch.classList.remove('active');
    }
    var activeContentCards = document.querySelectorAll('.content-card.active');
    for (var activeContentCard of activeContentCards) {
        activeContentCard.classList.remove('active');
    }
}

function requestProfile() {
    $.ajax({
        type: 'GET',
        url: '/employee/profile',
        dataType: 'json'
    }).done(function (data) {
        usernameInp.value = data.username;
        addressInp.value = data.address;
        emailInp.value = data.email;
        phoneInp.value = data.phone;
        var html = '<option value=""></option>';
        var companies = data.companies;
        for (var company of companies) {
            html += Mustache.to_html(
                companyOptTemplate.innerHTML, company
            );
        }
        belongsToInp.innerHTML = html;
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function requestAllGroups() {
    $.ajax({
        type: 'GET',
        url: '/employee/all-groups',
        dataType: 'json'
    }).done(function (data) {
        var html = '';
        var groups = data.groups;
        if (groups.length != 0) {
            for (var group of groups) {
                html += Mustache.to_html(
                    groupTemplate.innerHTML, group
                );
            }
        } else {
            html = '<tr><td class="prompt" colspan="100%">There is no groups now ……</td></tr>';
        }
        allGroupsContainer.innerHTML = html;
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function requestAllTasks() {
    $.ajax({
        type: 'GET',
        url: '/employee/all-tasks',
        dataType: 'json'
    }).done(function (data) {
        var html = '';
        var tasks = data.tasks;
        if (tasks.length != 0) {
            for (var task of tasks) {
                html += Mustache.to_html(
                    taskTemplate.innerHTML, task
                );
            }
        } else {
            html = '<tr><td class="prompt" colspan="100%">There is no tasks now ……</td></tr>';
        }
        allTasksContainer.innerHTML = html;
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function requestAllAnns() {
    $.ajax({
        type: 'GET',
        url: '/employee/all-anns',
        dataType: 'json'
    }).done(function (data) {
        var html = '';
        var anns = data.anns;
        if (anns.length != 0) {
            for (var ann of anns) {
                html += Mustache.to_html(
                    annTemplate.innerHTML, ann
                );
            }
        } else {
            html = '<tr><td class="prompt" colspan="100%">There is no announcements now ……</td></tr>';
        }
        allAnnsContainer.innerHTML = html;
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function updateNumNewNotifs() {
    $.ajax({
        type: 'GET',
        url: '/employee/num-new-notifs',
        dataType: 'json',
    }).done(function (data) {
        console.log(data);
        numNewNotifications.innerText = data.numNewNotifications;
    }).fail(function (data) {
        console.log(data);
    });
}

function showNotifs() {
    $.ajax({
        type: 'GET',
        url: '/employee/notifs',
        dataType: 'json',
    }).done(function (data) {
        console.log(data);
        var html = '';
        var notifs = data.notifs;
        if (notifs.length != 0) {
            for (var notif of notifs) {
                html += Mustache.to_html(
                    notifTemplate.innerHTML, notif
                );
            }
        } else {
            html = '<div class="prompt">No entries yet ...</div>';
        }
        notifsContainer.innerHTML = html;
        notificationModal.style.display = 'block';
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function readNotif(id) {
    $.ajax({
        type: 'POST',
        url: '/employee/read-notif',
        data: {
            id: id
        }
    }).done(function (data) {
        console.log(data);
        updateNumNewNotifs();
        showNotifs();
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function deleteNotif(id) {
    $.ajax({
        type: 'POST',
        url: '/employee/delete-notif',
        data: {
            id: id
        }
    }).done(function (data) {
        console.log(data);
        updateNumNewNotifs();
        showNotifs();
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

profileSwitch.onclick = function () {
    deactivateAll();
    requestProfile();
    profileSwitch.classList.add('active');
    profile.classList.add('active');
};

allGroupsSwitch.onclick = function () {
    deactivateAll();
    requestAllGroups();
    allGroupsSwitch.classList.add('active');
    allGroups.classList.add('active');
};

allTasksSwitch.onclick = function () {
    deactivateAll();
    requestAllTasks();
    allTasksSwitch.classList.add('active');
    allTasks.classList.add('active');
};

allAnnsSwitch.onclick = function () {
    deactivateAll();
    requestAllAnns();
    allAnnsSwitch.classList.add('active');
    allAnns.classList.add('active');
};

notificationBtn.onclick = function () {
    showNotifs();
};

window.onclick = function (evt) {
    if (evt.target == notificationModal) {
        notificationModal.style.display = 'none';
    }
};

setInterval(updateNumNewNotifs, 5000);
