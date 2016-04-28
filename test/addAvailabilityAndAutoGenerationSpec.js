describe("Component availability injection", function () {

    var availabilityInjector = require('../bin/addAvailability');
    var mockfs = require('mock-fs');
    var chai = require('chai');
    var fs = require('fs');

    var packageJson  = require('../package.json');
    var argParser = require('../bin/argumentParser');
    require('yaml-js');

    var expect = chai.expect;

    beforeEach(function () {
        packageJson.config = {
            outputPath: '../dist'
        };

        packageJson.lightModuleName = 'quux';

        var emptyPage =
            'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
            'templateScript: /foo/templates/bar/baz.ftl';

        var pageWithAreas =
            'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
            'templateScript: /foo/templates/bar/baz.ftl\n' +
            'areas:\n' +
            '  fooArea:\n' +
            '    templateScript: /foo/templates/bar/baz.ftl';

        var emptyPageWithTaggedElement =
            'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
            'includedFile: !include \'foo/bar\'\n' +
            'templateScript: /foo/templates/bar/baz.ftl';


        mockfs({
            '../dist/quux/templates/pages/emptyPage.yaml' : emptyPage,
            '../dist/foo/templates/pages/emptyPage.yaml' : emptyPage,
            '../dist/foo/templates/pages/emptyPageWithTaggedElement.yaml' : emptyPageWithTaggedElement,
            '../dist/foo/templates/pages/pageWithAreas.yaml': pageWithAreas
        });
    });

    afterEach(function() {
        mockfs.restore();
    });

    it("should be able to create missing YAML entries and add availability", function (done) {
        invokeAndVerify(
            ["foo:components/text", "--available@foo:pages/emptyPage@fooArea"],
            "/foo/templates/pages/emptyPage.yaml",
            function(data) {
                expect(data).to.be.equal(
                    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
                    'templateScript: /foo/templates/bar/baz.ftl\n' +
                    'areas:\n' +
                    '  fooArea:\n' +
                    '    availableComponents:\n' +
                    '      text:\n' +
                    '        id: foo:components/text\n');
                done();
            });
    });

    it("should be able to create missing YAML entries and add availability for a default light module", function (done) {
        invokeAndVerify(
            ["components/text", "--available@pages/emptyPage@fooArea"],
            "/quux/templates/pages/emptyPage.yaml",
            function(data) {
                expect(data).to.be.equal(
                    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
                    'templateScript: /foo/templates/bar/baz.ftl\n' +
                    'areas:\n' +
                    '  fooArea:\n' +
                    '    availableComponents:\n' +
                    '      text:\n' +
                    '        id: quux:components/text\n');
                done();
            });
    });

    it("should be able to create missing YAML entries and add availability despite custom tags", function (done) {
        invokeAndVerify(
            ["foo:components/text", "--available@foo:pages/emptyPageWithTaggedElement@fooArea"],
            "/foo/templates/pages/emptyPageWithTaggedElement.yaml",
            function(data) {
                expect(data).to.be.equal(
                    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
                    'includedFile: !include \'foo/bar\'\n' +
                    'templateScript: /foo/templates/bar/baz.ftl\n' +
                    'areas:\n' +
                    '  fooArea:\n' +
                    '    availableComponents:\n' +
                    '      text:\n' +
                    '        id: foo:components/text\n');
                done();
            }
        );
    });

    it("should be able to add component availability to existing area", function (done) {
        invokeAndVerify(
            ["foo:components/text", "--available@foo:pages/pageWithAreas@fooArea"],
            "/foo/templates/pages/pageWithAreas.yaml",
            function(data) {
                expect(data).to.be.equal(
                    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
                    'templateScript: /foo/templates/bar/baz.ftl\n' +
                    'areas:\n' +
                    '  fooArea:\n' +
                    '    templateScript: /foo/templates/bar/baz.ftl\n' +
                    '    availableComponents:\n' +
                    '      text:\n' +
                    '        id: foo:components/text\n');
                done();
            }
        );
    });

    it("should be able to add both  availability and autogeneration config", function (done) {
        invokeAndVerify(
            ["foo:components/text", "--available@foo:pages/emptyPageWithTaggedElement@fooArea"],
            "/foo/templates/pages/emptyPageWithTaggedElement.yaml",
            function () {
                invokeAndVerify(
                    ["foo:components/text", "--autogenerate@foo:pages/emptyPageWithTaggedElement@fooArea"],
                    "/foo/templates/pages/emptyPageWithTaggedElement.yaml",
                    function (data) {
                        expect(data).to.be.equal(
                            'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
                            'includedFile: !include \'foo/bar\'\n' +
                            'templateScript: /foo/templates/bar/baz.ftl\n' +
                            'areas:\n' +
                            '  fooArea:\n' +
                            '    availableComponents:\n' +
                            '      text:\n' +
                            '        id: foo:components/text\n' +
                            '    autoGeneration:\n' +
                            '      generatorClass: info.magnolia.rendering.generator.CopyGenerator\n' +
                            '      content:\n' +
                            '        text:\n' +
                            '          nodeType: mgnl:component\n' +
                            '          templateId: foo:components/text\n');
                        done();
                    }
                )
            }
        );
    });

    it("should be able to create missing YAML entries and add autogeneration", function (done) {
        invokeAndVerify(
            ["foo:components/text", "--autogenerate@foo:pages/emptyPage@main"],
            "/foo/templates/pages/emptyPage.yaml",
            function (data) {
                expect(data).to.be.equal(
                    'class: info.magnolia.templating.definition.PageTemplateDefinition\n' +
                    'templateScript: /foo/templates/bar/baz.ftl\n' +
                    'areas:\n' +
                    '  main:\n' +
                    '    autoGeneration:\n' +
                    '      generatorClass: info.magnolia.rendering.generator.CopyGenerator\n' +
                    '      content:\n' +
                    '        text:\n' +
                    '          nodeType: mgnl:component\n' +
                    '          templateId: foo:components/text\n');
                done();
            }
        );
    });

    function invokeAndVerify(argv, path, callback) {
        var args = argParser.parseArguments(argv);

        // Make sure args are parsed correctly
        expect(args.isValid).to.equal(true);

        // Add availability to page with no configured areas whatsoever
        availabilityInjector.addAvailability(args, function () {
            fs.readFile(packageJson.config.outputPath + path, 'utf-8', function (err, data) {
                expect(err).to.be.null;
                callback(data);
            });
        });
    }

});
