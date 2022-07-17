define([
    'jquery',
    'base/js/namespace',
    'base/js/events'
], function (
    $,
    IPython,
    events
) {
    "use strict";

    // define default values for config parameters
    var params = {

    };

    // update params with any specified in the server's config file
    var update_params = function () {
        var config = IPython.notebook.config;
        for (var key in params) {
            if (config.data.hasOwnProperty(key))
                params[key] = config.data[key];
        }

    };

    //Initialisierungsmethode
    var initialize = function () {
        update_params();

        const convertCSV = (data, delimiter = ',', omitFirstRow = false) =>
            data
                .slice(omitFirstRow ? data.indexOf('\n') + 1 : 0)
                .split('\n')
                .map(v => v.split(delimiter));

        var new_data = "";
        var data = [];

        const response = fetch('python2.csv')
            .then(response => response.text())
            .then(v => new_data = convertCSV(v, ',', true))
            .catch(err => console.log(err));

        setTimeout(() => {
            for (var date of new_data) {
                data.push(date);
            }

            //Erstellung der Dropdowns und Einträge
            var select = $('<select class="ui-widget-content"/>');
            var select_two = $('<select class="ui-widget-content" id="select_two"/ multiple>');
            var select_current_list = $('<select class="ui-widget-content" id="select_current_list"/>');

            var comp_array = [];
            var vals = {};
            var counter = 0;

            //Befüllung select mit categories - wo im csv ein 1er steht ist es eine category
            //Default Beüfllung select_two mti werten der ersten category
            for (var i of data) {
                var new_array = String(i).split(',');
                var id = new_array[0];
                var mc = new_array[1];
                var abr = String(new_array[2]);
                vals[abr] = id;

                if (mc == 1) {
                    counter++;
                    select.append($('<option/>').attr('value', abr).text(abr));
                }
                if (counter<2) {
                    select_two.append($('<option/>').attr('value', abr).text(abr));
                }
            }

            //Dynamisches Laden des zweiten Dropdowns bei änderung des ersten drop-downs
            //Dropdown wird geleert und mit Werten der selektierten Kategorie befüllen, wird beendet, wenn nächstes element eine category ist 
            select.change(function () {
                document.getElementById("select_two").innerHTML = null;
                var lever = false;
                for (var i = 0; i < data.length; i++) {
                    var curr_array = String(data[i]).split(',');
                    var next_array = String(data[i + 1]).split(',');
                    var next_mc = next_array[1];
                    var abr = String(curr_array[2]);

                    if (String(select.val()) == abr) {
                        lever = true;
                    }

                    if (lever == true) {
                        select_two.append($('<option/>').attr('value', abr).text(abr));
                        if (next_mc == 1) break;
                    }
                }
            });

            IPython.toolbar.element.append(
                $('<br/>')
            );

            //Hinzufügen der Dropdowns zur Toolbar
            IPython.toolbar.element.append(
                $('<label class="navbar-text"/>').text('Pick competency:')
            ).append(select);

            IPython.toolbar.element.append(
                $('<label class="navbar-text"/>').text('')
            ).append(select_two);

            var update_select = function () {
                document.getElementById("select_current_list").innerHTML = null;
                for (var entry of comp_array) {
                    var sel = entry;
                    console.log(String(entry));
                    select_current_list.append($('<option/>').attr('value', sel).text(sel));
                }
            };

            var delete_select = function () {
                document.getElementById("select_current_list").innerHTML = null;
            };

            //Funktion zum Einfügen der Kompetenz-Zelle
            var insert_metadata = function () {
                var selected_cell = Jupyter.notebook.get_selected_cell();
                var id_array = [];
                for (var entry of comp_array) {
                    var zs_array = vals[entry].split('_');
                    var curr_id = Number(zs_array[1]);
                    id_array.push(curr_id)
                }
                selected_cell.metadata.competencies = id_array;
                comp_array = [];
                delete_select();
            };

            var insert_into_list = function () {
                var new_array = String(select_two.val()).split(',');
                comp_array = comp_array.concat(new_array);
                update_select();
            };

            var delete_entries = function () {
                comp_array = [];
                delete_select();
            };

            IPython.toolbar.element.append(
                $('<label class="navbar-text"/>').text("Add to list ")
            );
            //Hinzufügen des Buttons für das hinzufügen von Kompetenzen für die Liste
            IPython.toolbar.add_buttons_group([
                Jupyter.keyboard_manager.actions.register({
                    'help': 'insert into competency list',
                    'icon': 'fa-plus',
                    'handler': insert_into_list
                }, 'addtolist-cell', 'Add to list')
            ]);
            IPython.toolbar.element.append(
                $('<label class="navbar-text"/>').text("Insert metadata ")
            );
            //Hinzufügen des Buttons für das einfügen in die Metadaten 
            IPython.toolbar.add_buttons_group([
                Jupyter.keyboard_manager.actions.register({
                    'help': 'insert into metadata',
                    'icon': 'fa-check',
                    'handler': insert_metadata
                }, 'addmetadata', 'Add metadata to cell')
            ]);

            IPython.toolbar.element.append(
                $('<label class="navbar-text"/>').text("Clear list ")
            );
            //Hinzufügen des Buttons für das einfügen der Textzeile zur Toolbar 
            IPython.toolbar.add_buttons_group([
                Jupyter.keyboard_manager.actions.register({
                    'help': 'delete entries from competency list',
                    'icon': 'fa-trash',
                    'handler': delete_entries
                }, 'deletefromlist-cell', 'delete from list')
            ]);

            IPython.toolbar.element.append(
                $('<br/>')
            );

            IPython.toolbar.element.append(
                $('<label class="navbar-text"/>').text('')
            ).append(select_current_list);

        }, "200")
    };

    //Laden des Plugins
    var load_ipython_extension = function () {
        return IPython.notebook.config.loaded.then(initialize);
    };

    return {
        load_ipython_extension: load_ipython_extension
    };
});