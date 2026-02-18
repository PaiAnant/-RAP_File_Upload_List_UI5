sap.ui.define(['sap/ui/core/mvc/ControllerExtension'], function (ControllerExtension) {
	'use strict';

	return ControllerExtension.extend('fileupload.ext.controller.FileUploadList', {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf fileupload.ext.controller.FileUploadList
			 */
			onInit: function () {
				// you can access the Fiori elements extensionAPI via this.base.getExtensionAPI
				var oModel = this.base.getExtensionAPI().getModel();
			},

			editFlow: {

				onAfterActionExecution: function (oEvent) {

					var sAction = oEvent.split('.')[6];

					switch (sAction) {
						case 'downloadTemplate':

							this._downloadTemplate();

						case 'ExcelUpload':

							this.getView().getModel().refresh();

						default:
							break;

					}

				}

			}
		},

		onUploadPressFromUI5: function () {
                 this._openUploadDialog();
		},

		_downloadTemplate: function () {
			var path = jQuery.sap.getModulePath("fileupload");

			var link = path + "/ext/documents/RAP File upload.xlsx";

			this.myWindow = window.open(link, "_blank");
		},
		_openUploadDialog: async function () {
			if (!this._pUploadDialog) {
				this._pUploadDialog = sap.ui.core.Fragment.load({
					id: this.getView().getId(), // important for unique IDs
					name: "fileupload.ext.fragments.UploadDialog",
					controller: this
				}).then(function (oDialog) {
					this.getView().addDependent(oDialog);
					return oDialog;
				}.bind(this));
			}
			const oDialog = await this._pUploadDialog;
			oDialog.open();
		},
		onUploadCancel: async function () {
			const oDialog = await this._pUploadDialog;
			oDialog.close();
		},
		onFileChange: function (oEvent) {
			const oFile = oEvent.getParameter("files") && oEvent.getParameter("files")[0];
			this._selectedFile = oFile;
			const oTxt = this.byId("txtFile");
			oTxt.setText(oFile ? ("Selected: " + oFile.name) : "No file selected");
		},

		onUploadConfirm: async function () {

			try {
				if (!this._selectedFile) {
					sap.m.MessageToast.show("Please select an Excel file");
					return;
				}
				const oFile = this._selectedFile;
				// 1) Convert file -> Base64
				const sBase64 = await this._readFileAsBase64(oFile);
				// 2) Call RAP action
				await this._callUploadActionV4({
					fileName: oFile.name,
					mimeType: oFile.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					base64: sBase64
				});
				// 3) Close dialog
				const oDialog = await this._pUploadDialog;
				oDialog.close();
				// 4) Refresh list report
				this.getView().getModel().refresh();
				sap.m.MessageToast.show("Upload successful");
			} catch (e) {
				console.error(e);
				sap.m.MessageBox.error("Upload failed. Check console / backend messages.");
			}

		},
		_readFileAsBase64: function (oFile) {
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => {
					// "data:application/vnd...;base64,AAAA..."
					const sDataUrl = reader.result;
					const sBase64 = sDataUrl.split(",")[1]; // take only base64 part
					resolve(sBase64);
				};
				reader.onerror = reject;
				reader.readAsDataURL(oFile);
			});
		},
		_callUploadActionV4: async function ({ fileName, mimeType, base64 }) {
			const oModel = this.getView().getModel(); // OData V4 model
			// Unbound action call
			const oOp = oModel.bindContext("/List/com.sap.gateway.srvd.zsrv_upload_list.v0001." + "uploadData(...)");
			oOp.setParameter("FileName", fileName);
			oOp.setParameter("MimeType", mimeType);
			oOp.setParameter("FileBase64", base64);
			await oOp.execute();               // backend call happens here
			return oOp.getBoundContext();      // optional: read result if action returns something

		}

	});
});
