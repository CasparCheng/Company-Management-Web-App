'use strict';

var numNewNotifications = document.getElementById('num-of-new-notifications');
var notificationBtn = document.getElementById('notification');
var notificationModal = document.getElementById('notification-modal');
var notifsContainer = document.getElementById('notifs');

var profileSwitch = document.getElementById('profile-switch');
var allEmployeesSwitch = document.getElementById('all-employees-switch');
var allGroupsSwitch = document.getElementById('all-groups-switch');
var allTasksSwitch = document.getElementById('all-tasks-switch');
var allAnnsSwitch = document.getElementById('all-anns-switch');

var profile = document.getElementById('profile');
var allEmployees = document.getElementById('all-employees');
var allGroups = document.getElementById('all-groups');
var allTasks = document.getElementById('all-tasks');
var allAnns = document.getElementById('all-anns');

var profileForm = document.getElementById('profile-form');
var usernameInp = profileForm.querySelector('#username-profile');
var addressInp = profileForm.querySelector('#address-profile');
var emailInp = profileForm.querySelector('#email-profile');
var phoneInp = profileForm.querySelector('#phone-profile');

var employeesContainer = document.getElementById('employees');
var employeeTemplate = document.getElementById('employee-template');

var notifTemplate = document.getElementById('notif-template');

var allGroupsContainer = document.getElementById('groups');
var groupModal = document.getElementById('group-modal');
var groupTemplate = document.getElementById('group-template');

var newGroupBtn = document.getElementById('new-group');

var groupForm = document.getElementById('group-form');
var groupIdInp = groupForm.querySelector('#groupid');
var groupnameInp = groupForm.querySelector('#groupname');
var membersInp = groupForm.querySelector('#members');

var employeeOptTemplate = document.getElementById('employee-opt-template');

var allTasksContainer = document.getElementById('tasks');
var taskTemplate = document.getElementById('task-template');

var groupOptTemplate = document.getElementById('group-opt-template');

var taskForm = document.getElementById('task-form');
var taskIdInp = taskForm.querySelector('#taskid');
var tasknameInp = taskForm.querySelector('#taskname');
var taskcontentInp = taskForm.querySelector('#taskcontent');
var assignedToInp = taskForm.querySelector('#assignedTo');

var taskModal = document.getElementById('task-modal');

var allAnnsContainer = document.getElementById('anns');
var annTemplate = document.getElementById('ann-template');

var annForm = document.getElementById('ann-form');
var annIdInp = annForm.querySelector('#annid');
var anntitleInp = annForm.querySelector('#anntitle');
var anncontentInp = annForm.querySelector('#anncontent');

var annModal = document.getElementById('ann-modal');

var newAnnBtn = document.getElementById('new-ann');


$(profileForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/company/profile',
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

$(groupForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/company/set-group',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        requestAllGroups();
        groupModal.style.display = 'none';
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });

    e.preventDefault();
});

$(taskForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/company/set-task',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        requestAllTasks();
        taskModal.style.display = 'none';
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });

    e.preventDefault();
});

$(annForm).submit(function (e) {
    var form = $(this);

    $.ajax({
        type: 'POST',
        url: '/company/set-ann',
        data: form.serialize()
    }).done(function (data) {
        console.log(data);
        requestAllAnns();
        annModal.style.display = 'none';
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
        url: '/company/profile',
        dataType: 'json'
    }).done(function (data) {
        usernameInp.value = data.username;
        addressInp.value = data.address;
        emailInp.value = data.email;
        phoneInp.value = data.phone;
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function requestAllEmployees() {
    $.ajax({
        type: 'GET',
        url: '/company/all-employees',
        dataType: 'json'
    }).done(function (data) {
        var html = '';
        var employees = data.employees;
        if (employees.length != 0) {
            for (var employee of employees) {
                html += Mustache.to_html(
                    employeeTemplate.innerHTML, employee
                );
            }
        } else {
            html = '<tr><td class="prompt" colspan="100%">There is no employees now ……</td></tr>';
        }
        employeesContainer.innerHTML = html;
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function requestAllGroups() {
    $.ajax({
        type: 'GET',
        url: '/company/all-groups',
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
        url: '/company/all-tasks',
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
        url: '/company/all-anns',
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

function newGroup() {
    $.ajax({
        type: 'GET',
        url: '/company/all-employees',
        dataType: 'json'
    }).done(function (data) {
        console.log(data);
        var html = '';
        var employees = data.employees;
        if (employees.length != 0) {
            for (var employee of employees) {
                html += Mustache.to_html(
                    employeeOptTemplate.innerHTML, employee
                );
            }
        }
        membersInp.innerHTML = html;
        groupIdInp.value = null;
        groupnameInp.value = '';
        groupModal.style.display = 'block';
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function editGroup(id) {
    $.ajax({
        type: 'GET',
        url: '/company/get-group',
        dataType: 'json',
        data: {
            id: id
        }
    }).done(function (data) {
        console.log(data);
        var html = '';
        var employees = data.employees;
        if (employees.length != 0) {
            for (var employee of employees) {
                html += Mustache.to_html(
                    employeeOptTemplate.innerHTML, employee
                );
            }
        }
        membersInp.innerHTML = html;
        groupIdInp.value = data.id;
        groupnameInp.value = data.groupname;
        groupModal.style.display = 'block';
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function deleteGroup(id) {
    $.ajax({
        type: 'POST',
        url: '/company/delete-group',
        data: {
            id: id
        }
    }).done(function (data) {
        console.log(data);
        requestAllGroups();
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function newTask() {
    $.ajax({
        type: 'GET',
        url: '/company/all-employees',
        dataType: 'json'
    }).done(function (data) {
        console.log(data);
        var html = '';
        var employees = data.employees;
        for (var employee of employees) {
            html += Mustache.to_html(
                employeeOptTemplate.innerHTML, employee
            );
        }
        $.ajax({
            type: 'GET',
            url: '/company/all-groups',
            dataType: 'json'
        }).done(function (data) {
            console.log(data);
            var groups = data.groups;
            for (var group of groups) {
                html += Mustache.to_html(
                    groupOptTemplate.innerHTML, group
                );
            }
            assignedToInp.innerHTML = html;
            taskIdInp.value = null;
            tasknameInp.value = '';
            taskcontentInp.value = '';
            taskModal.style.display = 'block';
        }).fail(function (data) {
            console.log(data);
            alert(data.status + ' ' + data.responseText);
        });
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function deleteTask(id) {
    $.ajax({
        type: 'POST',
        url: '/company/delete-task',
        data: {
            id: id
        }
    }).done(function (data) {
        console.log(data);
        requestAllTasks();
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function newAnn() {
    annIdInp.value = null;
    anntitleInp.value = '';
    anncontentInp.value = '';
    annModal.style.display = 'block';
}

function deleteAnn(id) {
    $.ajax({
        type: 'POST',
        url: '/company/delete-ann',
        data: {
            id: id
        }
    }).done(function (data) {
        console.log(data);
        requestAllAnns();
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function removeEmployee(username) {
    $.ajax({
        type: 'POST',
        url: '/company/remove-employee',
        data: {
            username: username
        }
    }).done(function (data) {
        console.log(data);
        requestAllEmployees();
        alert('Operation succeeds');
    }).fail(function (data) {
        console.log(data);
        alert(data.status + ' ' + data.responseText);
    });
}

function updateNumNewNotifs() {
    $.ajax({
        type: 'GET',
        url: '/company/num-new-notifs',
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
        url: '/company/notifs',
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
        url: '/company/read-notif',
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
        url: '/company/delete-notif',
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

allEmployeesSwitch.onclick = function () {
    deactivateAll();
    requestAllEmployees();
    allEmployeesSwitch.classList.add('active');
    allEmployees.classList.add('active');
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

newGroupBtn.onclick = function () {
    newGroup();
};

newAnnBtn.onclick = function () {
    newAnn();
};

window.onclick = function (evt) {
    if (evt.target == notificationModal) {
        notificationModal.style.display = 'none';
    } else if (evt.target == groupModal) {
        groupModal.style.display = 'none';
    } else if (evt.target == taskModal) {
        taskModal.style.display = 'none';
    } else if (evt.target == annModal) {
        annModal.style.display = 'none';
    }
};

setInterval(updateNumNewNotifs, 5000);
