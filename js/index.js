$(() => {
    const tableSearch = (state = { search: { firstName: "", lastName: "", textFilters: {}, checkboxes: {} } }, actions) => {
        switch (actions.type) {
            case "TEXT_FILTER":
                state.search.textFilters[actions.columnIndex] = actions.value;
                return state;
            case "INIT_CHECKBOX_FILTER":
                state.search.checkboxes[actions.identifier] = actions.value;
                return state;
            case "ADD_CHECKBOX_FILTER":
                if (state.search.checkboxes[actions.identifier].indexOf(actions.value) === -1) {
                    state.search.checkboxes[actions.identifier].push(actions.value);
                }
                return state;
            case "REMOVE_CHECKBOX_FILTER":
                const index = state.search.checkboxes[actions.identifier].indexOf(actions.value);
                if (index >= 0) {
                    state.search.checkboxes[actions.identifier].splice(index, 1);
                }
                return state;
            default: return state;
        }
    };

    const tableSearchStore = Redux.createStore(tableSearch);

    $(".text-filter").on("input", (e) => {
        const filterColumnIndex = $(e.currentTarget).data("filterColumnIndex");
        tableSearchStore.dispatch({ type: "TEXT_FILTER", columnIndex: filterColumnIndex, value: e.currentTarget.value });
    });

    $(".checkbox-filter-group").each((index, elem) => {
        const identifier = Math.round(Math.random() * 10000);
        const filterColumnIndex = parseInt($(elem).data("filterColumnIndex"));

        tableSearchStore.dispatch({ type: "INIT_CHECKBOX_FILTER", value: $(elem).find("input").map((i, e) => e.value).toArray(), identifier: identifier });

        $(elem).find("input").on("change", (e) => {
            if (e.currentTarget.checked === true) {
                tableSearchStore.dispatch({ type: "ADD_CHECKBOX_FILTER", value: e.currentTarget.value, identifier: identifier });
            } else if (e.currentTarget.checked === false) {
                tableSearchStore.dispatch({ type: "REMOVE_CHECKBOX_FILTER", value: e.currentTarget.value, identifier: identifier });
            }
        });

        $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
            const state = tableSearchStore.getState();
            return state.search.checkboxes[identifier].indexOf(data[filterColumnIndex]) >= 0;
        });
    });

    const registerFiltering = (table) => {
        tableSearchStore.subscribe(() => {
            const state = tableSearchStore.getState();

            for(let key in state.search.textFilters) {
                table.columns(key).search(state.search.textFilters[key]);
            }

            table.draw();
        });
    };

    const dataTable = $("#tPerson").DataTable({
        dom: "t"
    });

    registerFiltering(dataTable);
});