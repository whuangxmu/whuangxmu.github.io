# 实验目的
通过完成实验，理解数据链路层、网络层、传输层和应用层的基本原理。掌握用 Wireshark 观察网络流量并辅助网络侦听相关的编程；掌握用 Libpcap 或 WinPcap 库侦听并处理以太网帧和 IP 报文的方法；熟悉以太网帧、IP 报文、TCP 段和 FTP 命令的格式概念，掌握 TCP 协议的基本机制；熟悉帧头部或 IP 报文头部各字段的含义。熟悉 TCP 段和应用层数据协议的概念，熟悉 TCP 段头部各字段，熟悉 SMTP、FTP、HTTP 等协议的指令和数据的含义。

# 实验要求
以下是本次实验的要求：

1. 用侦听解析软件观察数据格式

   使用 Wireshark 或 Omnipeek 等网络侦听软件观察网络上的数据流，验证理论课讲授的网络协议层次嵌套；验证帧格式、IP 报文格式、TCP 段格式和 FTP 协议命令与响应的格式；验证 MAC 地址、IP 地址、TCP 端口等协议地址格式。

2. 用侦听解析软件观察 TCP 机制

   使用 Wireshark 侦听并观察 TCP 数据段，记录并截图下列过程：连接建立与拆除（SYN/ACK 三次握手与四次挥手）、序列号与确认号的变化、窗口机制与拥塞控制（如慢启动、拥塞避免）等。

3. 用 Libpcap/WinPcap 库侦听网络数据并记录统计

   使用 Libpcap 或 WinPcap 库侦听网络上的数据流，解析发送方与接收方的 MAC 和 IP 地址，并按如下 CSV 格式输出日志：

   ```
   时间,源MAC,源IP,目标MAC,目标IP,帧长度
   2015-03-14 13:05:16,60-36-DD-7D-D5-21,192.168.33.1,60-36-DD-7D-D5-72,192.168.33.2,1536
   ```

   每隔一段时间（例如 1 分钟），程序统计来自不同 MAC 和 IP 地址的通信数据长度，以及发送至不同 MAC 和 IP 地址的通信数据长度，并生成汇总统计。

4. 观察并分析（可选）HTTPS/HTTP 流量

   使用 Wireshark 侦听并观察 HTTP 与 HTTPS（在可控情况下、指定证书或单向加密场景）数据，分析访问特征。可在本地安装 LNMP（如 HUSTOJ）以生成测试流量，解析协议内容并记录与统计用户访问行为。程序在日志中应记录下列格式（CSV）示例：

   ```
   时间,源MAC,源IP,目标MAC,目标IP,登录名,口令,成功与否
   2015-03-14 13:05:16,60-36-DD-7D-D5-21,192.168.33.1,60-36-DD-7D-D5-72,192.168.33.2,student,software,SUCCEED
   2015-03-14 13:05:16,60-36-DD-7D-D5-21,192.168.33.1,60-36-DD-7D-D5-72,192.168.33.2,student,software1,FAILED
   ```

   （注：在真实网络中 HTTPS 数据通常是加密的，仅在受控/测试环境或可见密钥的情况下才可解析明文。）

5. 解析侦听到的 FTP 网络数据

   使用 Wireshark 侦听并分析 FTP 流量，观察并总结用户名/口令出现的上下文特征，提取用户名/口令的有效方法，并记录登录行为。日志格式示例同上：

   ```
   时间,源MAC,源IP,目标MAC,目标IP,登录名,口令,成功与否
   2015-03-14 13:05:16,60-36-DD-7D-D5-21,192.168.33.1,60-36-DD-7D-D5-72,192.168.33.2,student,software,SUCCEED
   2015-03-14 13:05:16,60-36-DD-7D-D5-21,192.168.33.1,60-36-DD-7D-D5-72,192.168.33.2,student,software1,FAILED
   ```

   通过分析 FTP 报文的“数据区”，提取用户名（以 "`USER`" 开头）、口令（以 "`PASS`" 开头），并根据服务器返回码（如 230 表示登录成功，530 表示失败）判断登录结果。

   如条件允许，可在虚拟机或受控网络中模拟交换机镜像端口以便获取完整的流量样本；注意多数交换机会划分广播域，故在普通局域网内侦听到的包可能有限。

   建议学有余力的同学将程序输出写入数据库，并制作简单网页展示实时侦听结果；对超过阈值的流量或异常行为实现告警。

# 安全警告

请务必注意以下安全警告事项：

1. 在测试过程中不要输入敏感的密码，如自己的银行卡密码、QQ 密码等，以防被写入表格。

2. 在本机搭设 FTP 和 HTTP 服务器，勿使用公开的 FTP 和 HTTP 服务器，避免影响其他组织服务器的正常运行。

# 附录一

观看 Bilibili 上的教学视频：“《计算机网络》实验3 用 WinPCAP 侦听并解析分组”：

https://www.bilibili.com/video/BV1TE411s7W2

# 附录二

原实验教程课本第3章，详见[PDF版](https://gitee.com/whuangxmu/courses/blob/master/Computer-Network-and-Internet/textbooks/experiment-handbook.pdf)。

# 附录三

原实验教程课本第3.4节，详见[PDF版](https://gitee.com/whuangxmu/courses/blob/master/Computer-Network-and-Internet/textbooks/experiment-handbook.pdf)。

# 附录四

参见“Programming with Libpcap - Sniffing the network from our own application”，链接：

http://www.programming-pcap.aldabaknocking.com/


```c
/* Simple Simple FTP Password grabber.                                   */
/* Author: Luis Martin Garcia. luis.martingarcia [.at.] gmail [d0t] com  */
/* To compile: gcc ftp_grabber.c -o ftpgrabber -lpcap                    */
/* Run as root!                                                          */
/*                                                                       */
/* This code is distributed under the GPL License. For more info check:  */
/* http://www.gnu.org/copyleft/gpl.html                                  */



#define __USE_BSD         /* Using BSD IP header           */ 
#include <netinet/ip.h>   /* Internet Protocol             */ 
#define __FAVOR_BSD       /* Using BSD TCP header          */ 
#include <netinet/tcp.h>  /* Transmission Control Protocol */ 
#include <pcap.h>         /* Libpcap                       */ 
#include <string.h>       /* String operations             */ 
#include <stdlib.h>       /* Standard library definitions  */ 

#define MAXBYTES2CAPTURE 2048


/* main(): Main function. Opens network interface for capture. Tells the kernel*/
/* to capture TCP packets to or from port 21. Looks for the string PASS into   */
/* packet payload. If string is found packet payload is printed to stdout.     */
int main(int argc, char* argv[]) {

    int count = 0, i = 0;
    bpf_u_int32 netaddr = 0, mask = 0;    /* To Store network address and netmask   */
    struct bpf_program filter;        /* Place to store the BPF filter program  */
    char errbuf[PCAP_ERRBUF_SIZE];    /* Error buffer                           */
    pcap_t* descr = NULL;             /* Network interface handler              */
    struct pcap_pkthdr pkthdr;        /* Packet information (timestamp,size...) */
    const unsigned char* packet = NULL; /* Received raw data                      */
    struct ip* iphdr = NULL;          /* IPv4 Header                            */
    struct tcphdr* tcphdr = NULL;     /* TCP Header                             */
    memset(errbuf, 0, PCAP_ERRBUF_SIZE);



    if (argc != 2) {
        fprintf(stderr, "USAGE: ftpgrabber <interface>\n");
        exit(1);
    }

    /* Open network device for packet capture */
    descr = pcap_open_live(argv[1], MAXBYTES2CAPTURE, 1, 512, errbuf);
    if (descr == NULL) {
        fprintf(stderr, "pcap_open_live(): %s \n", errbuf);
        exit(1);
    }

    /* Look up info from the capture device. */
    if (pcap_lookupnet(argv[1], &netaddr, &mask, errbuf) == -1) {
        fprintf(stderr, "ERROR: pcap_lookupnet(): %s\n", errbuf);
        exit(1);
    }

    /* Compiles the filter expression into a BPF filter program */
    if (pcap_compile(descr, &filter, "tcp port 21", 1, mask) == -1) {
        fprintf(stderr, "Error in pcap_compile(): %s\n", pcap_geterr(descr));
        exit(1);
    }

    /* Load the filter program into the packet capture device. */
    if (pcap_setfilter(descr, &filter) == -1) {
        fprintf(stderr, "Error in pcap_setfilter(): %s\n", pcap_geterr(descr));
        exit(1);
    }




    while (1) {
        /* Get one packet */
        if ((packet = pcap_next(descr, &pkthdr)) == NULL) {
            fprintf(stderr, "Error in pcap_next()\n", errbuf);
            exit(1);
        }

        if (strstr(packet + 14 + 20 + 20, "PASS")) { /* Does packet contain string "PASS"? */

            iphdr = (struct ip*)(packet + 14);
            tcphdr = (struct tcphdr*)(packet + 14 + 20);
            if (count == 0)printf("+----------------------------------------------+\n");
            printf("-> Received Packet No.%d:\n", ++count);
            printf("   DST IP: %s\n", inet_ntoa(iphdr->ip_dst));
            printf("   SRC IP: %s\n", inet_ntoa(iphdr->ip_src));
            printf("   SRC PORT: %d\n", ntohs(tcphdr->th_sport));
            printf("   DST PORT: %d\n", ntohs(tcphdr->th_dport));
            printf("   PACKET PAYLOAD:\n   ");

            for (i = 0; i < pkthdr.len; i++) {

                if (isprint(packet[i])) /* If it is a printable character, print it */
                    printf("%c ", packet[i]);
                else
                    printf(". ");

                if ((i % 16 == 0 && i != 0) || i == pkthdr.len - 1)
                    printf("\n   ");
            }
            printf("\n+----------------------------------------------+\n");
            memset((void*)packet, 0, pkthdr.len); /* Clean the buffer */
        }
    }



    return 0;

}

/* EOF */

```