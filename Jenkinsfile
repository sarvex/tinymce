#!groovy
@Library('waluigi@release/7') _

standardProperties()

node("headless-macos") {
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

    dir("modules/polaris") {
      stage("Publish to npm with rc tag") {
        exec("npm publish --tag rc-6.1")
      }
    }

    stage("Undo lerna changes") {
      exec("git reset --hard")
    }
  }
}
