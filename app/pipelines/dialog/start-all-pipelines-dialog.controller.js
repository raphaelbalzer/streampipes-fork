

export class StartAllPipelinesController {

    constructor($mdDialog, restApi, pipelines, action, activeCategory) {
        this.$mdDialog = $mdDialog;
        this.restApi = restApi;
        this.pipelines = pipelines;
        this.activeCategory = activeCategory;
        this.pipelinesToModify = [];
        this.installationStatus = [];
        this.installationFinished = false;
        this.page = "preview";
        this.nextButton = "Next";
        this.installationRunning = false;
        this.action = action;

        this.getPipelinesToModify();
        if (this.pipelinesToModify.length == 0) {
            this.nextButton = "Close";
            this.page = "installation";
        }
    }

    hide() {
        this.$mdDialog.hide();
    };

    cancel() {
        this.$mdDialog.cancel();
    };

    next() {
        if (this.page == "installation") {
            this.cancel();
        } else {
            this.page = "installation";
            this.initiateInstallation(this.pipelinesToModify[0], 0);
        }
    }

    getPipelinesToModify() {
        angular.forEach(this.pipelines, pipeline => {
            if (pipeline.running != this.action && this.hasCategory(pipeline)) {
                this.pipelinesToModify.push(pipeline);
            }
        });
    }

    hasCategory(pipeline) {
        var categoryPresent = false;
        if (this.activeCategory == "") return true;
        else {
            angular.forEach(this.pipeline.pipelineCategories, category => {
                if (category == this.activeCategory) {
                    categoryPresent = true;
                }
            });
            return categoryPresent;
        }
    }

    initiateInstallation(pipeline, index) {
        this.installationRunning = true;
        this.installationStatus.push({"name": pipeline.name, "id": index, "status": "waiting"});
        if (this.action) {
            this.startPipeline(pipeline, index);
        } else {
            this.stopPipeline(pipeline, index);
        }
    }

    startPipeline(pipeline, index) {
        this.restApi.startPipeline(pipeline._id)
            .success(data => {
                if (data.success) {
                    this.installationStatus[index].status = "success";
                } else {
                    this.installationStatus[index].status = "error";
                }
            })
            .error(data => {
                this.installationStatus[index].status = "error";
            })
            .then(() => {
                if (index < this.pipelinesToModify.length - 1) {
                    index++;
                    this.initiateInstallation(this.pipelinesToModify[index], index);
                } else {
                    this.refreshPipelines();
                    this.nextButton = "Close";
                    this.installationRunning = false;
                }
            });
    }
    

    stopPipeline(pipeline, index) {
        this.restApi.stopPipeline(pipeline._id)
            .success(data => {
                if (data.success) {
                    this.installationStatus[index].status = "success";
                } else {
                    this.installationStatus[index].status = "error";
                }
            })
            .error(data => {
                this.installationStatus[index].status = "error";
            })
            .then(() => {
                if (index < this.pipelinesToModify.length - 1) {
                    index++;
                    this.initiateInstallation(this.pipelinesToModify[index], index);
                } else {
                    this.refreshPipelines();
                    this.nextButton = "Close";
                    this.installationRunning = false;
                }
            });
    }
}

StartAllPipelinesController.$inject = ['$mdDialog', 'restApi', 'pipelines', 'action', 'activeCategory'];