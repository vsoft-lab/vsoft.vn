module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options: {
                livereload: true
            },
            css: {
                files: ['public/scss/*.scss'],
                tasks: ['compass']
            }
        },
        connect: {
            server: {
                options: {
                    port: 9001,
                    base: './'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    // Default task(s).
    grunt.registerTask('default', [
        'connect:server',
        'watch'
    ]);
};
