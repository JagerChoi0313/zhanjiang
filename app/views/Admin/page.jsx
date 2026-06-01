"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Empty, Input, message, Popconfirm, Select, Space, Spin, Table, Tabs, Tag } from "antd";
import { DeleteOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import Link from "next/link";
import { csrfFetch } from "../../../lib/csrf-client";

const PAGE_SIZE = 10;

const roleColor = {
  super_admin: "red",
  user: "blue",
};

const statusColor = {
  active: "green",
  disabled: "default",
};

const contentStatusMap = {
  0: { label: "普通删除", color: "orange" },
  1: { label: "正常", color: "green" },
  2: { label: "管理员删除", color: "red" },
};

const formatDate = (value) => (value ? String(value).slice(0, 19).replace("T", " ") : "-");

const buildQuery = ({ page, keyword, status }) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
  });
  if (keyword) params.set("q", keyword);
  if (status) params.set("status", status);
  return params.toString();
};

export default function AdminPage() {
  const [activeKey, setActiveKey] = useState("users");
  const [authorized, setAuthorized] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("1");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalCount: 0 });

  const endpoint = useMemo(() => {
    if (activeKey === "posts") return "/API/Admin/Posts";
    if (activeKey === "comments") return "/API/Admin/Comments";
    return "/API/Admin/Users";
  }, [activeKey]);

  const fetchRows = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const query = buildQuery({
        page: targetPage,
        keyword: keyword.trim(),
        status: activeKey === "users" ? undefined : status,
      });
      const response = await fetch(`${endpoint}?${query}`, {
        credentials: "include",
        cache: "no-store",
      });
      const result = await response.json();
      if (response.status === 401 || response.status === 403) {
        setAuthorized(false);
        setRows([]);
        return;
      }
      if (!result.success) {
        message.error(result.message || "获取管理数据失败");
        return;
      }
      setAuthorized(true);
      setRows(result.data ?? []);
      setPagination(result.meta?.pagination ?? { currentPage: targetPage, totalCount: 0 });
    } catch {
      message.error("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [activeKey, endpoint, keyword, page, status]);

  useEffect(() => {
    fetchRows(page);
  }, [fetchRows, page]);

  const resetAndSearch = () => {
    setPage(1);
    fetchRows(1);
  };

  const handleDelete = async (type, id) => {
    const response = await csrfFetch(`/API/Admin/${type}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const result = await response.json();
    if (!result.success) {
      message.error(result.message || "删除失败");
      return;
    }
    message.success(result.message);
    fetchRows(page);
  };

  const userColumns = [
    { title: "ID", dataIndex: "userId", width: 80 },
    { title: "昵称", dataIndex: "nickname" },
    { title: "邮箱", dataIndex: "email" },
    {
      title: "角色",
      dataIndex: "userRole",
      render: (value) => <Tag color={roleColor[value] ?? "default"}>{value}</Tag>,
    },
    {
      title: "状态",
      dataIndex: "userStatus",
      render: (value) => <Tag color={statusColor[value] ?? "default"}>{value}</Tag>,
    },
    { title: "创建时间", dataIndex: "createdAt", render: formatDate },
  ];

  const postColumns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "标题", dataIndex: "title" },
    { title: "分类", dataIndex: "category", width: 100 },
    { title: "地点", dataIndex: "location", width: 120 },
    { title: "作者", render: (_, row) => row.author?.nickname || "-" },
    { title: "创建时间", dataIndex: "createdAt", render: formatDate },
    {
      title: "状态",
      dataIndex: "status",
      render: (value) => {
        const item = contentStatusMap[value] ?? { label: value, color: "default" };
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: "操作",
      width: 100,
      render: (_, row) => row.status !== 1 ? "-" : (
        <Popconfirm title="确认删除这篇帖子？" onConfirm={() => handleDelete("Posts", row.id)}>
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const commentColumns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "内容", dataIndex: "content" },
    { title: "帖子", render: (_, row) => row.post?.title || "-" },
    { title: "作者", render: (_, row) => row.author?.nickname || "-" },
    { title: "创建时间", dataIndex: "createAt", render: formatDate },
    {
      title: "状态",
      dataIndex: "status",
      render: (value) => {
        const item = contentStatusMap[value] ?? { label: value, color: "default" };
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: "操作",
      width: 100,
      render: (_, row) => row.status !== 1 ? "-" : (
        <Popconfirm title="确认删除这条评论？" onConfirm={() => handleDelete("Comments", row.id)}>
          <Button danger size="small" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const columns = activeKey === "users"
    ? userColumns
    : activeKey === "posts"
      ? postColumns
      : commentColumns;

  if (authorized === null) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] flex items-center justify-center px-6">
        <Spin size="large" description="正在验证权限" />
      </main>
    );
  }

  if (authorized === false) {
    return (
      <main className="min-h-screen bg-[#f7f7f5] flex items-center justify-center px-6">
        <div className="bg-white border border-gray-100 rounded-lg p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-3">无权访问管理后台</h1>
          <p className="text-sm text-gray-500 mb-6">请使用超级管理员账号登录后再访问。</p>
          <Link href="/views/Login">
            <Button type="primary">前往登录</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-8 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-950">平台管理</h1>
            <p className="text-sm text-gray-500 mt-1">管理用户、帖子和评论数据</p>
          </div>
          <Button icon={<ReloadOutlined />} onClick={() => fetchRows(page)}>刷新</Button>
        </div>

        <div className="bg-white border border-gray-100 rounded-lg p-5">
          <Tabs
            activeKey={activeKey}
            onChange={(key) => {
              setActiveKey(key);
              setPage(1);
            }}
            items={[
              { key: "users", label: "用户" },
              { key: "posts", label: "帖子" },
              { key: "comments", label: "评论" },
            ]}
          />

          <Space className="mb-4" wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder={activeKey === "users" ? "搜索昵称或邮箱" : "搜索内容"}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onPressEnter={resetAndSearch}
              style={{ width: 260 }}
            />
            {activeKey !== "users" && (
              <Select
                value={status}
                onChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                options={[
                  { value: "1", label: "正常" },
                  { value: "0", label: "普通删除" },
                  { value: "2", label: "管理员删除" },
                  { value: "all", label: "全部" },
                ]}
                style={{ width: 120 }}
              />
            )}
            <Button type="primary" onClick={resetAndSearch}>搜索</Button>
          </Space>

          <Table
            rowKey={(row) => row.userId ?? row.id}
            loading={loading}
            columns={columns}
            dataSource={rows}
            locale={{ emptyText: <Empty description="暂无数据" /> }}
            pagination={{
              current: pagination.currentPage,
              total: pagination.totalCount,
              pageSize: PAGE_SIZE,
              showSizeChanger: false,
              onChange: setPage,
            }}
          />
        </div>
      </div>
    </main>
  );
}
