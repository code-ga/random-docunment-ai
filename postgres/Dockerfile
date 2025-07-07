ARG PG_VERSION=17
FROM postgres:$PG_VERSION AS init-db

COPY schema.sql /docker-entrypoint-initdb.d/

FROM ubuntu AS build
RUN apt-get update && apt-get install -y git make gcc g++ libssl-dev pkg-config
WORKDIR /tmp
RUN git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git
WORKDIR /tmp/pgvector
RUN make
FROM init-db

RUN apt-get update && \
		apt-mark hold locales && \
		apt-get install -y --no-install-recommends build-essential postgresql-server-dev-$PG_MAJOR

COPY --from=build /tmp/pgvector /tmp/pgvector

RUN cd /tmp/pgvector && \
		make clean && \
		make OPTFLAGS="" && \
		make install && \
		mkdir /usr/share/doc/pgvector && \
		cp LICENSE README.md /usr/share/doc/pgvector && \
		rm -r /tmp/pgvector && \
		apt-get remove -y build-essential postgresql-server-dev-$PG_MAJOR && \
		apt-get autoremove -y && \
		apt-mark unhold locales && \
		rm -rf /var/lib/apt/lists/*