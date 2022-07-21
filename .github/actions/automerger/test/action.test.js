const core = require("@actions/core");
const github = require("@actions/github");
const verifier = require("../verifier");
const default_rest_pulls_get = require("./fake_pull_request.json");
const default_rest_pulls_listFiles = require("./fake_pull_request_files.json");
const default_rest_repos_getContent = require("./fake_repos_getcontent.json");
const default_rest_checks_listForRef = require("./fake_commit_check_runs.json");
const default_rest_search_issuesAndPullRequests = require("./fake_list_pull_requests_by_author.json");

jest.mock("@actions/core");
jest.mock("@actions/github");

describe("GitHub action automerger", () => {
  test("Happy Path", async () => {
    const octokitMock = setupOctokitMock();

    github.context = {
      payload: {
        number: default_rest_pulls_get.data.number,
      },
    };

    await verifier();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(octokitMock.graphql).toHaveBeenCalledWith(
      expect.stringContaining('mergePullRequest'),
      expect.objectContaining({ mergeParams: {"pullRequestId" : default_rest_pulls_get.data.node_id } })
    );
  })

  test("not so Happy Path", async () => {
    const octokitMock = setupOctokitMock();

    github.context = {
      payload: {
        number: default_rest_pulls_get.data.number,
      },
    };

    await verifier();
    expect(core.setFailed).not.toHaveBeenCalled();
    expect(octokitMock.graphql).toHaveBeenCalledWith(
      expect.stringContaining('mergePullRequest'),
      expect.objectContaining({ mergeParams: {"pullRequestId" : default_rest_pulls_get.data.node_id } })
    );
  })

  const default_rest_pulls_get = require("./fake_pull_request.json");
  const default_rest_search_issuesAndPullRequests = require("./fake_list_pull_requests_by_author.json");
  const default_rest_checks_listForRef = require("./fake_commit_check_runs.json");
  const default_rest_pulls_listFiles = require("./fake_pull_request_files.json");
  const default_rest_repos_getContent = require("./fake_repos_getcontent.json");

  function setupOctokitMock({
                              rest_pulls_get = default_rest_pulls_get,
                              rest_pulls_listFiles = default_rest_pulls_listFiles,
                              rest_repos_getContent = default_rest_repos_getContent,
                              rest_checks_listForRef = default_rest_checks_listForRef,
                              rest_search_issuesAndPullRequests = default_rest_search_issuesAndPullRequests
                            } = {}) {

    const octokitMock = {
      graphql: jest.fn(),
      rest: {
        repos: {
          getContent: jest
            .fn()
            .mockResolvedValue(rest_repos_getContent),
        },
        pulls: {
          get: jest.fn().mockResolvedValue(rest_pulls_get),
          listFiles: jest
            .fn()
            .mockResolvedValue(rest_pulls_listFiles),
          merge: jest.fn().mockResolvedValue(undefined),
        },
        checks: {
          listForRef: jest
            .fn()
            .mockResolvedValue(rest_checks_listForRef),
        },
        search: {
          issuesAndPullRequests: jest
            .fn()
            .mockResolvedValue(rest_search_issuesAndPullRequests),
        },
      },
    };
    github.getOctokit.mockReturnValue(octokitMock);
    return octokitMock;
  }

});
