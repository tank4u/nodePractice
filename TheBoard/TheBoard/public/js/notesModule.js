(function () {
    //create Angular module [ng-app]
    var app = angular.module("notesModule", ["ui.bootstrap"]);

    app.controller("notesController", 
        ["$scope", "$window", "$http",
        function ($scope, $window, $http) {
            $scope.notes = [];
            $scope.newNote = createBlankNote();
                        
            //get category name
            var urlParts = $window.location.pathname.split("/");
            var categoryname = urlParts[urlParts.length - 1];
            
            var notesApiUrl = "/api/notes/" + categoryname;
            
            $http.get(notesApiUrl)
            .then(function (result) { 
                    $scope.notes = result.data;
                        }, 
                  function (err) {                         
                    alert('Error during API call: ' + err);
            });
            
            var socket = io.connect(); //we can pass server details, but here both are handled by same node process
            //socket.on("SomeKey", function (msg) {
            //    alert(msg);
            //});
            
            socket.emit("join category", categoryname);
            
            socket.on("broadcast note", function (note) {
                $scope.notes.push(note);
                $scope.$apply(); //force model refresh from non-Angular code
            });

            $scope.save = function () {
                $http.post(notesApiUrl, $scope.newNote)
                    .then(function (result) {
                        $scope.notes.push(result.data);
                        $scope.newNote = createBlankNote();
                        socket.emit("newNote", { note: result.data, category: categoryname });
                        //alert('saved');
                    },function (err) { 
                        alert(err);
                    });
            };
            
            

            function createBlankNote() {
                return {
                    note : "",
                    color : "yellow"
                };
            }
        }
    ]);

})();