var options = {

    initialize: function() {
        
        if (!localStorage.getItem('options')) localStorage.setItem('options','{}');

        const def = {
            scenarioId: scenarios[0].getId(),
            lang: app.lang,
        };

        const options = _.defaults(this.readOptions(), def);
        
        this.saveOptions(options);
        
        _.each(options, (value, key) => { this[key] = value; });

        $('#app-options .app-content').append(
            `<div class="options-row" style="justify-content: center;"><button id="clear-data-button" class="btn" data-lang="CLEAR_DATA"></button></div>`
        );

        // lang
        makeSelector({
            element: document.getElementById('options-lang-selector'),
            options: _.map(languages, language => [language.getName(), language.getId()]),
            value: _.find(languages, language => language.getId() == this.readOption('lang')).getId(),
            onChange: 'options.onLangChange',
        });

        // investigators quantity
        makeSelector({
            element: document.getElementById('options-investigators-quantity-selector'),
            options: ['1', '2', '3', '4', '5', '6'],
            value: this.readOption('investigatorsQuantity') || '4',
            onChange: 'options.onInvestigatorsQuantityChange',
        });

        // clear data
        document.getElementById('clear-data-button').addEventListener('click', event => {
            modalPrompt(()=>{
                localStorage.clear();
                location.reload();
            });
        });

    },

    saveOption: function(key, value){
        this[key] = value;
        const options = this.readOptions();
        options[key] = value;
        this.saveOptions(options);
    },

    saveOptions: function(options) {
        localStorage.setItem('options', JSON.stringify(options));
    },

    readOption: function(key){
        return this[key];
    },

    readOptions: function(name, value){
        return JSON.parse(localStorage.getItem('options'));
    },

    isExpansionAvailable(scenarioOrMonster) {
        const expId = scenarioOrMonster.getExpId();
        const expansion = expansions.find(expansion => expansion.getId() === expId);
        if (!expansion) return false;
        return true; // all expansions are always included
    },

    onLangChange: function (event) {
        const lang = event.target.value;
        options.saveOption('lang', lang);
        app.setLang(lang);
        app.renderScenario();
        app.applyLanguage();
    },

    onInvestigatorsQuantityChange: function (event) {
        const value = event.target.value;
        options.saveOption('investigatorsQuantity', value);
        app.renderScenario();
    },

}
