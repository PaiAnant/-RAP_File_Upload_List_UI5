sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/JourneyRunner"
], function (opaTest, runner) {
    "use strict";

    function journey() {
        QUnit.module("First journey");

        opaTest("Start application", function (Given, When, Then) {
            Given.iStartMyApp();

            Then.onTheListList.iSeeThisPage();
            Then.onTheListList.onTable().iCheckColumns(8, {"LineNum":{"header":"Line"},"PoNumber":{"header":"PO Number"},"PoItem":{"header":"PO Item"},"LocalLastChangedAt":{"header":"Last Used At"},"GrUantity":{"header":"Quantity"},"UnitOfMeasure":{"header":"UoM"},"SiteId":{"header":"Site ID"},"HeaderText":{"header":"Header Text"}});

        });


        opaTest("Navigate to ObjectPage", function (Given, When, Then) {
            // Note: this test will fail if the ListReport page doesn't show any data
            
            When.onTheListList.onFilterBar().iExecuteSearch();
            
            Then.onTheListList.onTable().iCheckRows();

            When.onTheListList.onTable().iPressRow(0);
            Then.onTheListObjectPage.iSeeThisPage();

        });

        opaTest("Teardown", function (Given, When, Then) { 
            // Cleanup
            Given.iTearDownMyApp();
        });
    }

    runner.run([journey]);
});