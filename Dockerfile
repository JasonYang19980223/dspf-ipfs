FROM node:14.0.0
ADD web.tar /
WORKDIR /dspf-ipfs
ENTRYPOINT ["/dspf-ipfs/run.sh"]