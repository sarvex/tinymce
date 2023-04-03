#!groovy
@Library('waluigi@release/7') _

standardProperties()

node("aws-tools") {
  timestamps {
    checkout scm

    def cleanAndInstall = {
      echo "Installing tools"
      sh "git clean -fdx modules scratch js dist"
      yarnInstall()
    }

    // our linux nodes have multiple executors, sometimes yarn creates conflicts
    lock("Don't run yarn simultaneously") {
      stage("Install tools") {
        cleanAndInstall()
      }
    }

    stage("Bump lerna versions to preminor") {
      sh "yarn lerna version preminor --yes"
    }

    dir("modules/polaris") {
      stage("Publish to npm with rc tag") {
        sshagent(credentials: ['jenkins2-github']) {
          sh "yarn lerna publish from-package --yes --dist-tag=rc"
        }
      }
    }

    stage("Undo lerna changes") {
      sh "git reset --hard"
    }
  }
}
