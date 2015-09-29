function isHasPermission(feature) {
    if (feature.Roles != undefined) {
        var denyRoles = [], allowRoles = [];
        $.each(feature.Roles[0], function (roleType, roleId) {
            switch (roleType) {
                case "Deny":
                    for (var d = 0; d < roleId.length; d++) {
                        denyRoles.push(roleId[d].text);
                    }
                    break;
                case "Allow":
                    for (var a = 0; a < roleId.length; a++) {
                        allowRoles.push(roleId[a].text);
                    }
                    break;
            }
        });


        var parameters = JSON.parse(getItemLocalStorage(localStorageConstant.LoggedOnUser));
        //if (parameters == null) 
        //return true;

        //Check for Deny Roles
        if (denyRoles != null & denyRoles != undefined) if (denyRoles.length > 0)
            for (var i = 0; i < denyRoles.length; i++) for (var j = 0; j < parameters.Roles.length; j++)
                if (parameters.Roles[j].GroupId.toLowerCase() == denyRoles[i].toLowerCase()) return false;

        //Check for Allow Roles

        if (allowRoles == null | allowRoles == undefined) return true;
        if (allowRoles.length < 1) return true;

        for (var i = 0; i < allowRoles.length; i++) for (var j = 0; j < parameters.Roles.length; j++)
            if (parameters.Roles[j].GroupId.toLowerCase() == allowRoles[i].toLowerCase()) return true;

        return false;
    }
    return true;
};

function checkPermissionByKey(permission, key) {
    if (permission == null) {
        return false;
    }
    else if (permission.indexOf('Deny') != -1) {
        return false;
    } else if (permission.indexOf('Manage') != -1) {
        return true;
    } else if (permission.indexOf(key) != -1) {
        return true;
    } else {
        return false;
    }
}