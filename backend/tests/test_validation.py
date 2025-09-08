import pytest
from app.utils.validation import (
    validate_github_url,
    validate_org_access,
    sanitize_input,
    validate_search_query,
    validate_sort_order
)


class TestValidateGithubUrl:
    def test_valid_https_urls(self):
        valid_urls = [
            "https://github.com/owner/repo",
            "https://github.com/owner/repo/",
            "https://github.com/test-org/test-repo",
            "https://github.com/test_org/test_repo",
            "https://github.com/test.org/test.repo"
        ]
        for url in valid_urls:
            assert validate_github_url(url), f"Should be valid: {url}"
    
    def test_valid_ssh_urls(self):
        valid_urls = [
            "git@github.com:owner/repo.git",
            "git@github.com:test-org/test-repo.git"
        ]
        for url in valid_urls:
            assert validate_github_url(url), f"Should be valid: {url}"
    
    def test_valid_short_urls(self):
        valid_urls = [
            "github.com/owner/repo",
            "github.com/owner/repo/"
        ]
        for url in valid_urls:
            assert validate_github_url(url), f"Should be valid: {url}"
    
    def test_invalid_urls(self):
        invalid_urls = [
            "https://gitlab.com/owner/repo",
            "https://github.com/owner",
            "https://github.com/owner/repo/issues",
            "not-a-url",
            "",
            "https://github.com/",
            "https://github.com/owner/repo/tree/main"
        ]
        for url in invalid_urls:
            assert not validate_github_url(url), f"Should be invalid: {url}"


class TestValidateOrgAccess:
    def test_no_restrictions(self):
        # When no allowed orgs are configured, all should be allowed
        assert validate_org_access("any-org")
        assert validate_org_access("test-org")
    
    def test_with_restrictions(self):
        # This would need to be tested with actual settings
        pass


class TestSanitizeInput:
    def test_normal_input(self):
        assert sanitize_input("hello world") == "hello world"
        assert sanitize_input("test-repo_name") == "test-repo_name"
    
    def test_remove_control_characters(self):
        assert sanitize_input("hello\x00world") == "helloworld"
        assert sanitize_input("test\x1frepo") == "testrepo"
    
    def test_length_limit(self):
        long_text = "a" * 2000
        result = sanitize_input(long_text, max_length=100)
        assert len(result) == 100
    
    def test_empty_input(self):
        assert sanitize_input("") == ""
        assert sanitize_input(None) == ""


class TestValidateSearchQuery:
    def test_valid_queries(self):
        valid_queries = [
            "test",
            "test-repo",
            "test_repo",
            "owner/repo",
            "test repo name",
            "test.repo"
        ]
        for query in valid_queries:
            assert validate_search_query(query), f"Should be valid: {query}"
    
    def test_invalid_queries(self):
        invalid_queries = [
            "test<script>",
            "test;DROP TABLE",
            "test'OR'1'='1",
            "a" * 101  # Too long
        ]
        for query in invalid_queries:
            assert not validate_search_query(query), f"Should be invalid: {query}"
    
    def test_empty_query(self):
        assert validate_search_query("")
        assert validate_search_query(None)


class TestValidateSortOrder:
    def test_valid_orders(self):
        valid_orders = [
            'last_commit_at_desc',
            'last_commit_at_asc',
            'name_asc',
            'name_desc',
            'created_at_desc',
            'last_activity_at_desc',
            'last_activity_at_asc'
        ]
        for order in valid_orders:
            assert validate_sort_order(order), f"Should be valid: {order}"
    
    def test_invalid_orders(self):
        invalid_orders = [
            'invalid_order',
            'last_commit_at',
            'name',
            '',
            'DROP TABLE'
        ]
        for order in invalid_orders:
            assert not validate_sort_order(order), f"Should be invalid: {order}"