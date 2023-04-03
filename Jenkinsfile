#!groovy
@Library('waluigi@release/7') _

standardProperties()

node("aws-tools") {
  timestamps {
    checkout scm

    def cleanAndInstall = {
      echo "Installing tools"
      exec("git clean -fdx modules scratch js dist")
      yarnInstall()
    }

    // our linux nodes have multiple executors, sometimes yarn creates conflicts
    lock("Don't run yarn simultaneously") {
      stage("Install tools") {
        cleanAndInstall()
      }
    }

    stage("Bump lerna versions to preminor") {
      exec("yarn lerna version preminor --no-git-tag-version --yes")
    }

    dir("modules/phoenix") {
      stage("Prepublish") {
        exec("yarn tsc -b")
      }

      stage("Publish to npm with rc tag") {
        sshagent(credentials: ['jenkins2-github']) {
          exec("npm publish --tag=rc")
        }
      }
    }

    stage("Undo lerna changes") {
      exec("git reset --hard")
    }
  }
}
