$(function () {

    initScript();

    // 筛选表单reset
    initFormField($("form.form-field"));

    //时间选择器
    initFormatDate($(".data-time"));

    initEdit($('#edit-container'));

    // 二级联动
    initChange($('select[data-change]'));

    // 地区筛选
    initRegion($('select[name=province]'));
});


function initScript() {

    $('a[data-json]').on('click', function () {

        var param = $(this).data('json');

        if (!$.isPlainObject(param)) {
            param = $.parseJSON(param);
        }

        var ajax = param.ajax ? param.ajax : {};

        if (param.confirm) {
            initConfirm(param.confirm, ajax);
        } else if (param.prompt) {
            initPrompt(param.prompt, ajax);
        }

        return false;
    });
}

/**
 *
 * @param param
 * @returns {boolean}
 */
function asyncRequest(param) {

    if (!param.url) {
        return;
    }

    var url = transUrl(param.url);

    $.ajax({
        url: url,
        type: param.type ? param.type : 'post',
        data: param.data ? param.data : {},
        dataType: param.dataType ? param.dataType : 'json',
        success: function (resp) {
            if (resp.code) {

                if (param.redirect) {
                    window.location.href = param.redirect;
                    return;
                }

                if (resp.url) {
                    window.location.href = param.url;
                    return;
                }

                success(resp.msg);

            } else {
                error(resp.msg);
            }
        }
    });

    return true;
}

/**
 *
 * @param param
 * @param ajax
 */
function initConfirm(param, ajax) {
    var message = param.message ? param.message : '请再次确认?';

    var title = param.config.title ? param.config.title : '请确认';
    var icon = param.config.icon ? param.config.icon : 3;

    layer.confirm(message, {title: title, icon: icon}, function () {
        if (ajax) {
            asyncRequest(ajax);
        }
    });
}

/**
 *
 * @param param
 * @param ajax
 */
function initPrompt(param, ajax) {

    if (!param.input) {
        return;
    }

    var input = param.input;
    var config = param.config ? param.config : {title: '请确认', icon: 3};

    if (input) {

        var content = '';

        var concat = function (item) {
            return '<div class="form-group">'
                + '<label class="col-sm-3 control-label no-padding-right">' + item.title + '</label>'
                + '<div class="col-sm-9">'
                + '<input name="' + item.name + '" value="' + item.value + '" data-message="' + item.message + '" class="prompt-input col-xs-10 col-sm-10"/>'
                + '</div>'
                + '</div>';
        };

        if ($.isArray(input)) {
            for (var i in input) {
                content += concat(input[i]);
            }
        } else {
            content += concat(input);
        }

        content = '<form class="form-horizontal">' + content + '</form>';

        layer.open({
            title: config.title ? config.title : '请输入',
            content: content,
            area: ["500px", ""],
            yes: function () {
                if (ajax) {
                    var error = false;
                    $('.prompt-input').each(function () {
                        var name = $.trim($(this).attr('name'));
                        var value = $.trim($(this).val());
                        var message = $.trim($(this).data('message'));
                        if (message && !value) {
                            layer.tips(message, $(this));
                            error = true;
                            return false;
                        } else {
                            ajax.data[name] = value;
                        }
                    });
                    if (error) {
                        return false;
                    }
                    layer.closeAll();
                    asyncRequest(ajax);
                }
            }
        });
    }
}

/**
 * 操作成功后弹出的提示信息
 * @param text
 */
function success(text) {
    text = text ? text : '操作成功';
    layer.alert(text, {icon: 1}, function () {
        window.location.reload();
    });
}

/**
 * 操作失败后弹出的提示信息
 * @param text
 */
function error(text) {
    text = text ? text : '操作失败';
    layer.alert(text, {icon: 2});
}

/**
 *
 * @param element
 */
function initFormField(element) {
    element.on('submit', function () {
        var url = $(this).attr('action');
        var data = $(this).serializeArray();
        var param = '';
        for (var i in data) {
            if (data[i].value !== '') {
                param += data[i].name + '=' + encodeURIComponent(data[i].value) + '&';
            }
        }
        if (param) {
            console.log(param);
            url = url.replace(/(server.html\?)/, '$1' + param);
        }
        window.location.href = url;
        return false;
    });
}

/**
 *
 * @param element
 */
function initFormatDate(element) {
    element.on('click', function () {
        WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm:ss'});
    });
}

/**
 *
 * @param element
 */
function initEdit(element) {
    // 富文本编辑器
    if (element.size()) {
        var ue = UE.getEditor('edit-container');
    }
}

/**
 * 初始化二级联动
 * @param element
 */
function initChange(element) {

    if (element.length > 0) {

        element.on('change', function () {
            var json_data = $(this).data('change');
            var id = $(this).val();
            change(json_data, id);
        });

        element.each(function () {
            var json_data = $(this).data('change');
            var id = $(this).val();
            change(json_data, id);
        })
    }
}

/**
 * 二级联动
 * @param json_data
 * @param id
 */
function change(json_data, id) {
    if (json_data.child_name) {
        var child_name = json_data.child_name;
        var child_list = json_data.child_list;
        var obj = $('select[name=' + child_name + ']')
        if (child_list) {
            var data = child_list[id];
            var html = '<option value="">不限</option>';
            if (data) {
                for (var i in data) {
                    html += '<option value=' + data[i].value + '>' + data[i].title + '</option>';
                }
                obj.html(html);
                var value = obj.attr('value');
                if (value) {
                    obj.val(value);
                }
            }
            else {
                obj.html(html);
            }
        }
    }
}

/**
 *
 * @param element
 */
function initRegion(element) {
    if (element.length && REGION) {

        callbackProvince();

        callbackCity();

        callbackArea();

        element.on('change', function () {
            callbackCity();
        });

        $('select[name=city]').on('change', function () {
            callbackArea();
        });
    }
}

/**
 * 回填省份
 */
function callbackProvince() {
    var province = $('select[name=province]');
    var option = '<option value="">不限</option>';
    for (var i in REGION) {
        option += '<option value="' + REGION[i].id + '">' + REGION[i].name + '</option>';
    }
    province.html(option);
    var value = province.attr('value');
    if (value) {
        province.val(value);
    }
}

/**
 * 回填城市
 */
function callbackCity() {
    var province_id = $('select[name=province]').val();
    var city = $('select[name=city]');
    if (city.length > 0) {
        var option = '<option value="">不限</option>';
        if (province_id) {
            var children = REGION[province_id].children;
            if (children) {
                for (var i in children) {
                    option += '<option value="' + children[i].id + '">' + children[i].name + '</option>';
                }
            }
            city.html(option);
            value = city.attr('value');
            if (value) {
                city.val(value);
            }
        } else {
            city.html(option);
        }
    }
}

/**
 * 回填区域
 */
function callbackArea() {
    var province_id = $('select[name=province]').val();
    var city_id = $('select[name=city]').val();
    var area = $('select[name=area]');
    if (area.length) {
        var option = '<option value="">不限</option>';
        if (city_id) {
            var children = REGION[province_id]['children'][city_id]['children'];
            if (children) {
                for (var i in children) {
                    option += '<option value="' + children[i].id + '">' + children[i].name + '</option>';
                }
            }
            area.html(option);
            value = area.attr('value');
            if (value) {
                area.val(value);
            }
        } else {
            area.html(option);
        }
    }
}