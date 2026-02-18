sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"fileupload/test/integration/pages/ListList",
	"fileupload/test/integration/pages/ListObjectPage"
], function (JourneyRunner, ListList, ListObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('fileupload') + '/test/flp.html#app-preview',
        pages: {
			onTheListList: ListList,
			onTheListObjectPage: ListObjectPage
        },
        async: true
    });

    return runner;
});

