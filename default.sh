#!/bin/bash

# ==================================================
# Debian 12 终极初始化脚本 (GitHub 直装版)
# 功能：时区/BBR/改端口/写入密钥/强禁密码/Fail2Ban/防火墙
# ==================================================

# 您的公钥
MY_SSH_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDL/1jPyO2541/jQke/iO0CfGHjToPWxsmOIIWse3ExROv5ijRyux9RWncVvgp7vsYiUJ/qBNarUdzDuWGkIX+lXNvC/h6JSvkxYsP5ipC4maf64P3UMRpcWSBfCDNEq3LuL9gnRNhV9lFDyWRcG2TdzHFXtYSf1+jmKgvCR0X+WreH2ruTMez1ac59qDFQ+s65QfqkRza6/vkBAlNprZzTrkByS5vkS2EqN7IZccKsx2f+LJqxJmuBGLT9ed1wBGNcBiybBW/61hiNhF6M6v5DnyG3WtNxxID2DAOlWk0ujdYEMm3Dp4bkm0hq3waV/SEBrGWDtTl3rnETWSiiFZTx ssh-key-2025-08-17"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}错误：请使用 root 权限运行！${NC}"
  exit 1
fi

clear
echo -e "${GREEN}=== 开始 Debian 12 系统初始化 ===${NC}"

# --------------------------------------------------
# 1. 交互式设置 SSH 端口
# --------------------------------------------------
while true; do
    echo -e "${YELLOW}为了安全，建议修改默认的 22 端口${NC}"
    read -p "请输入新的 SSH 端口号 (留空则默认为 22222): " SSH_PORT
    SSH_PORT=${SSH_PORT:-22222}
    
    if [[ "$SSH_PORT" =~ ^[0-9]+$ ]] && [ "$SSH_PORT" -ge 22 ] && [ "$SSH_PORT" -le 65535 ]; then
        echo -e "${GREEN}-> 目标 SSH 端口: $SSH_PORT${NC}"
        break
    else
        echo -e "${RED}输入错误，请输入有效数字。${NC}"
    fi
done

# --------------------------------------------------
# 2. 写入 SSH 公钥
# --------------------------------------------------
echo -e "${YELLOW}[2/7] 配置 SSH 密钥...${NC}"
mkdir -p /root/.ssh
chmod 700 /root/.ssh
echo "$MY_SSH_KEY" > /root/.ssh/authorized_keys
chmod 600 /root/.ssh/authorized_keys

if grep -q "ssh-key-2025-08-17" /root/.ssh/authorized_keys; then
    echo -e "${GREEN}公钥写入成功。${NC}"
else
    echo -e "${RED}公钥写入失败，脚本停止。${NC}"
    exit 1
fi

# --------------------------------------------------
# 3. 更新系统 & 安装软件
# --------------------------------------------------
echo -e "${YELLOW}[3/7] 更新系统 & 安装 curl, wget, ufw, fail2ban...${NC}"
timedatectl set-timezone Asia/Shanghai
apt update && apt upgrade -y
apt install -y curl wget ufw fail2ban

# --------------------------------------------------
# 4. 开启 BBR 加速
# --------------------------------------------------
echo -e "${YELLOW}[4/7] 开启 TCP BBR...${NC}"
sed -i '/net.core.default_qdisc/d' /etc/sysctl.conf
sed -i '/net.ipv4.tcp_congestion_control/d' /etc/sysctl.conf
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p > /dev/null 2>&1

# --------------------------------------------------
# 5. 核心：修改 SSH 配置 (端口 + 强禁密码)
# --------------------------------------------------
echo -e "${YELLOW}[5/7] 修改 SSH 配置...${NC}"
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# 5.1 处理 sshd_config.d 目录下的干扰文件
if [ -d "/etc/ssh/sshd_config.d" ]; then
    sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config.d/*.conf 2>/dev/null
    sed -i 's/ChallengeResponseAuthentication yes/ChallengeResponseAuthentication no/g' /etc/ssh/sshd_config.d/*.conf 2>/dev/null
fi

# 5.2 修改主配置文件
如果 grep -q“^#\？端口”/etc/ssh/sshd_config；然后
 sed -i -E“s/^#？端口 [0-9]+/端口 $SSH_PORT/" /etc/ssh/sshd_config
别的
 echo "禁 $SSH_PORT" >> /etc/ssh/sshd_config
菲

sed -i -E“s/^#？Pubkey身份验证。*/PubkeyAuthentication 是/"/etc/ssh/sshd_config
sed -i -E“s/^#？密码验证。*/等数数数/"/etc/ssh/sshd_config
sed -i -E“s/^#？挑战响应身份验证。*/ChallengeResponseAuthentication no/" /etc/ssh/sshd_config
sed -i -E“s/^#？KbdInteractive身份验证。*/KbdInteractiveAuthentication no/" /etc/ssh/sshd_config

# -----------------------------
# 6。配置防火墙（UFW）
# -----------------------
echo -e "${YELLOW}[6/7] 配黄黄火子（黄行 SSH, 80, 443)...${NC}"
echo "y" | ufw 重置 > /dev/null
ufw 默认拒绝传入
ufw 默认允许传出
ufw 允许 $SSH_PORT/tcp 注释“SSH 端口”
ufw 允许 80/tcp 注释“HTTP”
ufw 慁许 443/tcp 注释“HTTPS”
echo "y" | ufw 启用 > /dev/null

# --------------------
# 7。Fail2Ban 禁止
# ------------------
echo -e "${YELLOW}[7/7] 配置 Fail2Ban 并重启禁务……${NC}"
cat>/etc/fail2ban/jail。当地的 <<大败
[默认]
ignoreip = 127。0。0。1/8::1
班色子 = 3600
查找时间=600
maxretry = 5

[嘘]
已启用 = 真的
端口 = $SSH_PORT
过滤子 = sshd
日志路径 = /var/log/auth。日志
后端 = systemd
大败

systemctl 重子 ssh
systemctl 故障2ban
apt autoremove -y > /dev/null 2>&1

# -----------------
# 8。运行完毕总结
# ----------------
echo -e "\n${GREEN}=== 系统初始化配置完成 ===${NC}"
echo -e“已成功执声廥下操作:”
echo -e " - 一洲/一海 一洲/一海
echo -e " - curl、wget、ufw、fail2ban）"
echo -e " - 开启内核 TCP BBR 网络加速"
echo -e " - 写入 SSH 公钥并彻底禁用密码登录"
echo -e " - 修改 SSH 端口为: ${YELLOW}$SSH_PORT${NC}"
echo -e " - 启动 UFW 防火墙并放桌端口: ${YELLOW}$SSH_PORT, 80, 443${NC}"
echo -e " - 故障 Fail2Ban SSH 故障故障"
echo -e "${GREEN}==========================${NC}\n"
